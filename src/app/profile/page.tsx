import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getReferralCode, getReferralCount } from "@/server/services/referral.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const referralCode = getReferralCode(userId);
  const referralCount = getReferralCount(userId);
  const inviteUrl = `${process.env.NEXTAUTH_URL ?? ""}/auth/login?ref=${referralCode}`;

  return (
    <div className="container container--content" style={{ paddingTop: "2rem" }}>
      <h1>Profile</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        {(session.user as { phone?: string }).phone ?? session.user.name}
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Referrals</h2>
        <div className="card" style={{ maxWidth: 400, marginTop: "1rem" }}>
          <p>Your referral code: <strong>{referralCode}</strong></p>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", wordBreak: "break-all" }}>
            Invite link: {inviteUrl}
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Total referrals: <strong>{referralCount}</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
