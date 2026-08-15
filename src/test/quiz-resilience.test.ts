import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildProductPlans } from "@/components/ProtocolPlans";
import { products } from "@/data/products";
import { buildFallbackProtocol } from "@/lib/quizProtocolFallback";

const completeAnswers = {
  issues: "stubborn-fat",
  lifestyle: "active",
  experience: "never",
  readiness: "ready-now",
  budget: "standard",
};

describe("quiz resilience", () => {
  it.each(["fat-loss", "recovery", "both"] as const)(
    "builds a catalog-matched fallback for %s",
    (goal) => {
      const protocol = buildFallbackProtocol({ ...completeAnswers, goal }, "Test User");
      const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

      expect(protocol.protocolName).toBeTruthy();
      expect(protocol.peptides.length).toBeGreaterThan(0);
      for (const peptide of protocol.peptides) {
        const target = norm(peptide.name);
        expect(
          products.some((product) => {
            const name = norm(product.name);
            const slug = norm(product.slug);
            return name.includes(target) || target.includes(name) || slug.includes(target) || target.includes(slug);
          }),
        ).toBe(true);
      }
    },
  );

  it("uses exact one-, three- and six-month cart totals", () => {
    expect(buildProductPlans(1_000, 2_550)).toEqual([
      { id: "monthly", label: "1 Month — Single Vials", months: 1, perMonth: 1_000, total: 1_000 },
      { id: "starter", label: "3 Months — 3-Pack Cycle", months: 3, perMonth: 850, total: 2_550 },
      { id: "commitment", label: "6 Months — 2× 3-Pack Cycle", months: 6, perMonth: 850, total: 5_100 },
    ]);
  });

  it("keeps the public protocol function reachable without a user session", () => {
    const config = readFileSync("supabase/config.toml", "utf8");
    expect(config).toMatch(/\[functions\.generate-protocol\]\s+verify_jwt = false/);
  });
});
