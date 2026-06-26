/**
 * Cycle processor — runs on a schedule (Vercel Cron: hourly).
 * Finds active circles whose nextPayoutAt has passed and triggers payouts.
 *
 * The on-chain payout() enforces contribution checks: if the scheduled
 * recipient has not contributed for the current cycle the contract marks them
 * as defaulted and skips the transfer. The scheduler therefore calls payout()
 * unconditionally — default handling is enforced at the contract level.
 *
 * In production: query DB, fetch recipient Stellar keys, call processCyclePayout.
 */
export async function processDueCycles(): Promise<void> {
  // TODO: query DB for circles WHERE status='active' AND next_payout_at <= NOW()
  // For each:
  //   1. Call the on-chain payout() — contract handles defaulted-member penalty
  //   2. Check is_defaulted(recipient) on-chain; update DB member status if true
  //   3. Call processCyclePayout(circle.id, recipientStellarKey) to record result
  console.warn("[scheduler] processDueCycles — wire up DB query here");
}
