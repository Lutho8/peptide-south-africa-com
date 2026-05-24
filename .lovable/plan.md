## Wire up Make webhook on waitlist form

Update `src/components/WaitlistSection.tsx` only.

### Changes

1. **Replace placeholder URL**
   - `MAKE_WEBHOOK_URL` → `https://hook.eu1.make.com/ypm5hnevcxlmc7j9tl68fhxiigl5yb8a`

2. **Add a Name field**
   - New required `name` state + `<Input>` above the email field (label: "Full name").
   - Form currently only has email + whatsapp; spec requires `name` in payload.

3. **Update POST payload** to:
   ```json
   {
     "name": "...",
     "email": "...",
     "whatsapp": "...",
     "source": "store_waitlist",
     "timestamp": "<ISO>"
   }
   ```
   - Drop `no-cors` so we can actually detect success/failure via `response.ok`.
   - Drop the old `submittedAt` key (replaced by `timestamp`).

4. **Real success/error handling**
   - Remove the swallow-all try/catch that always "succeeds".
   - On `response.ok`: show toast
     - Title: `You're on the list.`
     - Description: `We'll be in touch before October.`
     - Increment local counter, clear fields.
   - On thrown error or non-ok response: show destructive toast
     - Title: `Something went wrong.`
     - Description: `WhatsApp us directly instead.` with an `<a href="https://wa.me/491624747159">` action link (rendered via toast `action` or inside description).
   - Counter only increments on success.

### Out of scope
No other files change. Styling, layout, copy headline, and the localStorage counter mechanic stay as-is.
