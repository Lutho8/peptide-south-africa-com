# Peptide South Africa

Premium research-peptide e-commerce, GP-led clinical pathway, and retention infrastructure.

## Design system

- **Vial branding**: any component that renders a vial box (product card, PDP, cart tile, checkout summary, 3D mock) must import styling from `src/lib/vialDesign.ts`. See [`docs/vial-design.md`](docs/vial-design.md) for the required pattern and the CI guards that block regressions.

## Tests

```bash
bunx vitest run            # unit + guard tests
bunx playwright test       # visual regression + e2e
```
