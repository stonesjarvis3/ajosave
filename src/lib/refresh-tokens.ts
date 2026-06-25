import { query } from "./db";
import { sendSms } from "./sms";

function createToken(): string {
  return `rt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export interface RefreshTokenRecord {
  token: string;
  familyId: string;
  userId: string;
  revokedAt?: Date | null;
}

export async function rotateRefreshToken(userId: string, familyId: string): Promise<RefreshTokenRecord> {
  const token = createToken();
  const userResult = await query<{ id: string; phone: string }>("SELECT id, phone FROM users WHERE id = $1", [userId]);
  if (!userResult.rows[0]) {
    throw new Error("User not found");
  }

  await query("INSERT INTO refresh_tokens (user_id, family_id, token, revoked_at, created_at) VALUES ($1, $2, $3, NULL, NOW())", [userId, familyId, token]);
  return { token, familyId, userId };
}

export async function useRefreshToken(token: string, userId: string): Promise<RefreshTokenRecord | null> {
  const result = await query<{ id: string; token: string; family_id: string; revoked_at: Date | null; user_id: string }>(
    "SELECT id, token, family_id, revoked_at, user_id FROM refresh_tokens WHERE token = $1 AND user_id = $2",
    [token, userId]
  );

  const record = (result as { rows?: Array<any> }).rows?.[0];
  if (!record || record.revoked_at) {
    await revokeUserSessions(userId);
    const user = await query<{ phone: string }>("SELECT phone FROM users WHERE id = $1", [userId]);
    const phone = (user as { rows?: Array<{ phone?: string }> } | undefined)?.rows?.[0]?.phone;
    if (phone) {
      await sendSms(phone, "Ajosave security alert: a suspicious refresh token reuse was detected and all your sessions were revoked.");
    }
    return null;
  }

  await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1", [token]);
  return { token: record.token, familyId: record.family_id, userId: record.user_id };
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1", [userId]);
}
