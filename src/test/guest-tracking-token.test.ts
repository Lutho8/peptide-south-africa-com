import { describe, it, expect } from 'vitest';
import { createGuestTrackingToken, verifyGuestTrackingToken } from '../../api/_shared/guestTracking';
const secret = 'test-only-secret-with-at-least-32-characters';
const id = '11111111-1111-4111-8111-111111111111';
const now = 1793780000000;
describe('guest order tracking capabilities', () => {
  it('accepts an authentic token for only its issued order', async () => {
    const token = await createGuestTrackingToken(id, secret, now);
    expect(await verifyGuestTrackingToken(token, secret, now)).toBe(id);
    expect(await verifyGuestTrackingToken(token.replace(id,'22222222-2222-4222-8222-222222222222'), secret, now)).toBeNull();
    expect(await verifyGuestTrackingToken(token, secret + 'wrong', now)).toBeNull();
  });
  it('rejects expired, future, malformed and unsigned capabilities', async () => {
    const token = await createGuestTrackingToken(id, secret, now);
    expect(await verifyGuestTrackingToken(token, secret, now + 91*86400*1000)).toBeNull();
    expect(await verifyGuestTrackingToken(token, secret, now - 301000)).toBeNull();
    expect(await verifyGuestTrackingToken(`${id}.abc`, secret, now)).toBeNull();
    expect(await verifyGuestTrackingToken(token.slice(0,-2), secret, now)).toBeNull();
    await expect(createGuestTrackingToken(id, 'short', now)).rejects.toThrow();
  });
});
