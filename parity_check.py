#!/usr/bin/env python3
"""
PSA Migration Parity Checker
============================
Standalone Python script to verify row-count parity between SOURCE and TARGET.

Usage:
    python3 parity_check.py
    
    # Or with env vars:
    SOURCE_DB_URL="postgres://..." TARGET_DB_URL="postgres://..." python3 parity_check.py
"""

import os
import sys
import json
from datetime import datetime, timezone
from urllib.parse import urlparse

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 is required. Install: pip install psycopg2-binary")
    sys.exit(1)


def get_env_or_prompt(name: str, secret: bool = False) -> str:
    """Get value from environment or prompt interactively."""
    value = os.environ.get(name, "").strip()
    if value:
        return value
    prompt = f"Enter {name}: "
    if secret:
        import getpass
        value = getpass.getpass(prompt)
    else:
        value = input(prompt)
    return value.strip()


def connect(url: str, label: str):
    """Connect to PostgreSQL and return connection."""
    try:
        conn = psycopg2.connect(url)
        conn.autocommit = True
        print(f"  ✅ Connected to {label}")
        return conn
    except Exception as e:
        print(f"  ❌ Failed to connect to {label}: {e}")
        sys.exit(1)


def get_table_counts(conn, label: str) -> dict:
    """Get row counts for all public tables."""
    counts = {}
    with conn.cursor() as cur:
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [row[0] for row in cur.fetchall()]
        
        for table in tables:
            try:
                cur.execute(f'SELECT COUNT(*) FROM "{table}"')
                count = cur.fetchone()[0]
                counts[table] = count
            except Exception as e:
                counts[table] = f"ERROR: {e}"
    
    return counts


def get_auth_user_count(conn, label: str) -> int:
    """Get auth.users count."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM auth.users")
            return cur.fetchone()[0]
    except Exception as e:
        print(f"  ⚠️  Could not count auth.users in {label}: {e}")
        return -1


def compare_counts(source_counts: dict, target_counts: dict) -> list:
    """Compare source vs target and return mismatch list."""
    all_tables = sorted(set(source_counts.keys()) | set(target_counts.keys()))
    mismatches = []
    
    for table in all_tables:
        s = source_counts.get(table, "MISSING")
        t = target_counts.get(table, "MISSING")
        if s != t:
            mismatches.append({
                "table": table,
                "source": s,
                "target": t,
                "match": False
            })
        else:
            mismatches.append({
                "table": table,
                "source": s,
                "target": t,
                "match": True
            })
    
    return mismatches


def mask_url(url: str) -> str:
    """Redact password from connection string for display."""
    try:
        parsed = urlparse(url)
        if parsed.password:
            return url.replace(parsed.password, "***REDACTED***")
    except:
        pass
    return url


def main():
    print("=" * 60)
    print("  PSA Migration Parity Checker")
    print("=" * 60)
    print()
    
    # Get connection strings
    source_url = get_env_or_prompt("SOURCE_DB_URL", secret=True)
    target_url = get_env_or_prompt("TARGET_DB_URL", secret=True)
    
    print()
    print(f"SOURCE: {mask_url(source_url)}")
    print(f"TARGET: {mask_url(target_url)}")
    print()
    
    # Connect
    print("Connecting...")
    source_conn = connect(source_url, "SOURCE (cveapedneuhgbxqydpjc)")
    target_conn = connect(target_url, "TARGET (eutszmrsukoqqeilzrbv)")
    print()
    
    # Get auth counts
    print("Counting auth.users...")
    source_auth = get_auth_user_count(source_conn, "SOURCE")
    target_auth = get_auth_user_count(target_conn, "TARGET")
    print(f"  SOURCE auth.users: {source_auth}")
    print(f"  TARGET auth.users: {target_auth}")
    auth_match = source_auth == target_auth
    print(f"  Match: {'✅' if auth_match else '❌'}")
    print()
    
    # Get table counts
    print("Counting public tables...")
    source_counts = get_table_counts(source_conn, "SOURCE")
    target_counts = get_table_counts(target_conn, "TARGET")
    
    print(f"  SOURCE tables: {len(source_counts)}")
    print(f"  TARGET tables: {len(target_counts)}")
    print()
    
    # Compare
    print("Comparing row counts...")
    comparisons = compare_counts(source_counts, target_counts)
    
    matched = sum(1 for c in comparisons if c["match"])
    mismatched = sum(1 for c in comparisons if not c["match"])
    
    print(f"  ✅ Matched: {matched}")
    print(f"  {'✅' if mismatched == 0 else '❌'} Mismatched: {mismatched}")
    print()
    
    if mismatched > 0:
        print("MISMATCHED TABLES:")
        print("-" * 50)
        for c in comparisons:
            if not c["match"]:
                print(f"  ❌ {c['table']}: SOURCE={c['source']} TARGET={c['target']}")
        print()
    
    # Build report
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ref": "cveapedneuhgbxqydpjc",
        "target_ref": "eutszmrsukoqqeilzrbv",
        "auth_users": {
            "source": source_auth,
            "target": target_auth,
            "match": auth_match
        },
        "table_summary": {
            "source_count": len(source_counts),
            "target_count": len(target_counts),
            "matched": matched,
            "mismatched": mismatched
        },
        "mismatched_tables": [c for c in comparisons if not c["match"]],
        "all_tables": comparisons
    }
    
    # Save report
    output_file = "parity_report.json"
    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"Full report saved to: {output_file}")
    print()
    
    # Final verdict
    if auth_match and mismatched == 0:
        print("=" * 60)
        print("  ✅ PARITY CHECK PASSED — Ready for cutover")
        print("=" * 60)
        source_conn.close()
        target_conn.close()
        return 0
    else:
        print("=" * 60)
        print("  ❌ PARITY CHECK FAILED — Do NOT proceed with cutover")
        print("=" * 60)
        source_conn.close()
        target_conn.close()
        return 1


if __name__ == "__main__":
    sys.exit(main())
