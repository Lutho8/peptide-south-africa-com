## Footer: Bottom Legal Bar

Move the legal compliance links (Impressum, Terms & Conditions, etc.) to a dedicated horizontal row at the very bottom of the footer, below the copyright line.

### Changes

1. **Footer.tsx — Bottom Bar**
   - Add a horizontal legal-links row below the copyright text, containing:
     - Impressum
     - Terms & Conditions
     - Privacy Policy
     - Shipping Policy
     - Refund Policy
   - All links use `marketPath()` so they preserve the active market (`/de/...`, `/za/...`).
   - Keep auth links (Sign in / Admin / Sign out) in a separate row or alongside.

2. **Footer.tsx — Main Columns**
   - Remove the **Legal** column from the main 5-column grid to avoid duplication, since its links will live in the bottom bar.
   - Add FAQ to **Trust & Safety** or **Shop** column so it remains accessible.

### Result
The footer will end with a clean legal bar at the bottom: small text, horizontal layout, easy to find for compliance scanning, with all links market-aware.