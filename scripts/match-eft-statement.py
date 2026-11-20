#!/usr/bin/env python3
"""Match an incoming-credit CSV to awaiting EFT orders without changing order state."""
import argparse
from collections import Counter, defaultdict
import csv
from decimal import Decimal, InvalidOperation
import re
import sys

REFERENCE = re.compile(r"(?<![A-Z0-9-])PSA-[A-Z0-9]{6}(?![A-Z0-9-])", re.I)
AMOUNT = re.compile(r"[+-]?\d+(?:\.\d{1,2})?")

def read_csv(path, required, delimiter):
    with open(path, encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source, delimiter=delimiter)
        headers = reader.fieldnames or []
        if len(headers) != len(set(headers)) or not set(required).issubset(headers):
            raise ValueError(f"Expected columns: {', '.join(required)}")
        for row in reader:
            if None in row or any(row[name] is None for name in required):
                raise ValueError(f"Malformed CSV record at line {reader.line_num}")
            yield reader.line_num, row

def amount(value):
    value = value.strip()
    if not AMOUNT.fullmatch(value):
        raise ValueError("Expected an ungrouped decimal amount with a dot separator")
    result = Decimal(value)
    if abs(result) > 10_000_000:
        raise ValueError("Amount exceeds supported range")
    return result

def match(statement, orders):
    awaiting = defaultdict(list)
    for _, order in orders:
        if order["payment_status"].strip() != "awaiting_eft":
            continue
        ref = order["payment_reference"].strip().upper()
        if not REFERENCE.fullmatch(ref):
            continue
        order_id = order["order_id"].strip()
        if not re.fullmatch(r"[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}", order_id):
            raise ValueError("Expected an order UUID")
        awaiting[ref].append((order_id, amount(order["order_total"])))

    credits = []
    counts = Counter()
    debit_refs = set()
    for line, row in statement:
        value = amount(row["amount"])
        refs = set(ref.upper() for ref in REFERENCE.findall(row["reference"]))
        if value < 0:
            debit_refs.update(refs)
        if value <= 0:
            continue
        counts.update(refs)
        credits.append((line, value, refs))

    for line, value, refs in credits:
        if len(refs) != 1:
            yield line, "", "", f"{value:.2f}", "review_reference"
            continue
        ref = next(iter(refs))
        candidates = awaiting[ref]
        if counts[ref] != 1:
            status = "review_multiple_credits"
        elif ref in debit_refs:
            status = "review_related_debit"
        elif len(candidates) > 1:
            status = "review_multiple_orders"
        elif not candidates:
            status = "review_no_awaiting_order"
        elif candidates[0][1] != value:
            status = "review_amount_mismatch"
        else:
            yield line, ref, candidates[0][0], f"{value:.2f}", "candidate_staff_approval"
            continue
        yield line, ref, "", f"{value:.2f}", status

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("statement", help="Bank-exported posted transaction CSV")
    parser.add_argument("orders", help="Read-only order export CSV")
    parser.add_argument("--statement-delimiter", choices=[",", ";", "\t"], default=",")
    args = parser.parse_args()
    try:
        rows = list(match(
            read_csv(args.statement, ("reference", "amount"), args.statement_delimiter),
            read_csv(args.orders, ("order_id", "payment_reference", "order_total", "payment_status"), ","),
        ))
    except (OSError, ValueError, InvalidOperation, csv.Error) as error:
        parser.exit(2, f"Statement match stopped: {error}\n")
    writer = csv.writer(sys.stdout)
    writer.writerow(("statement_line", "reference", "order_id", "amount", "review_status"))
    writer.writerows(rows)

if __name__ == "__main__":
    main()
