## Goal

Make the brand logo behave as a universal "home" control: clicking it anywhere on the site returns the user to the hero on `/`, and the installed/home-screen icon (favicon, Apple touch icon, PWA install) opens the same place.

## What's already correct

- `src/components/Header.tsx` already wraps the logo in `<Link to="/">` for both desktop (`logo-horizontal`) and mobile (`logo-icon`) variants, with `aria-label="Peptide South Africa — home"`.
- `index.html` already declares `/favicon.png`, `/apple-touch-icon.png`, and links `site.webmanifest`.
- `public/site.webmanifest` already has `start_url: "/"`, `scope: "/"`, and 192/512/180px icons.

## What to fix

1. **Logo click while already on `/` does nothing visible.** React Router's `Link` to the current path won't scroll, so a user deep in the homepage who taps the logo stays where they are. Add an `onClick` on the header logo `Link` that, when `location.pathname === "/"`, calls `window.scrollTo({ top: 0, behavior: "smooth" })` and also closes the mobile menu if open. On other routes, let the normal navigation happen (the existing route change behaviour will land them at the top of `/`).

2. **Ensure the hero is reachable by anchor.** Give the `HomePage` hero section an `id="top"` (or reuse an existing top-of-page landmark) so the logo target is explicit and any future "back to top" links can share it.

3. **Replace placeholder favicon/PWA icons with the brand logo.** Right now `public/favicon.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, and `public/icon-512.png` may not be the navy/teal Peptide SA logo. Regenerate them from the existing `src/assets/logo-icon.png.asset.json` (the same mark used in the mobile header) at 32, 180, 192, and 512 px so the home-screen button visually matches the in-app logo.

4. **No PWA/service-worker changes.** Per the PWA guidance, this is manifest-only home-screen support — we keep things as-is, no service worker is added.

## Technical details

- `src/components/Header.tsx`: import `useLocation` from `react-router-dom`. Add a `handleLogoClick` handler used by both the desktop and mobile logo `Link`s.
- `src/pages/HomePage.tsx`: add `id="top"` to the outer wrapper or the hero `<section>` so screen readers / future skip-links have a stable target.
- `public/` icons: produce new 512×512 master from the brand logo on a navy background (matches `theme_color: #0a2540`), downsize to 192, 180 (apple-touch), and 32 (favicon).
- No changes to `index.html` head tags, `site.webmanifest`, or routing.

## Out of scope

- Adding offline support / service workers.
- Changing header layout, nav items, or the mobile drawer.
- Touching SEO metadata beyond the icon files.
