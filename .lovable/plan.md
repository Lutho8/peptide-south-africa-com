# Fix "Ride The Tide" branding leak on Google login

## Root cause

The text **"Ride The Tide Shop Build"** on the Google consent screen is **not in the app code** — I searched the entire codebase and found zero references to "ride the tide" / "ridethetide".

That string is the **Lovable project's display name**. The managed Google OAuth flow shows the project name (and its first-letter avatar — the "R") on the consent screen. There's also a leftover custom domain `ridethetide.site` / `www.ridethetide.site` still attached to this project.

Nothing in the React code, Supabase config, or assets needs to change for the consent screen — it's a project-settings + custom-domain issue.

## What needs to happen

### 1. Rename the Lovable project (fixes the consent screen)
Only you can do this — it lives in Project Settings, not in code.

- Open **Project Settings → rename** from `Ride The Tide Shop Build` to **`Peptide South Africa`**.
- After saving, the next Google login will show "Grant permission to **Peptide South Africa**" and a "P" avatar instead of "R".

I'll surface the settings entry point in chat once we're in build mode.

### 2. Remove the `ridethetide.site` custom domains
The project currently has these custom domains attached:
- `peptide-south-africa.com` ✅ keep
- `www.peptide-south-africa.com` ✅ keep
- `ridethetide.site` ❌ remove
- `www.ridethetide.site` ❌ remove

This is also done from Project Settings → Domains (I can't detach domains from code). Removing them prevents the old brand from being reachable and prevents any stray share links from showing the old name.

### 3. Codebase audit — already clean
- `rg -i "ride.?the.?tide|ridethetide"` across the repo: **0 matches**.
- Brand, logo, favicon, manifest, SEO, and OG tags are already "Peptide South Africa".
- No code changes required.

### 4. Optional: tighten Google button copy
The current `AuthPage` uses the managed `lovable.auth.signInWithOAuth("google", …)` flow, which is correct. No code change needed there. If you'd like, I can add a small note under the Google button like *"You'll be redirected to Google to authorize Peptide South Africa"* so users have context before they see the consent screen — say the word and I'll add it.

## Out of scope
- No changes to auth logic, Supabase config, RLS, or edge functions.
- No favicon/logo regeneration (already done in the previous turn).
- No new pages or routes.

## Your next step
Confirm you'd like me to (a) post the Project Settings deep-link so you can rename + detach the two `ridethetide.site` domains, and (b) optionally add the reassurance line under the Google button. Once renamed, log out and retry Google sign-in — the consent screen will say **Peptide South Africa**.
