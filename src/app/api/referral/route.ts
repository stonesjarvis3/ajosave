import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReferralCode, getReferralsByUser, getReferralCount, trackReferral } from "@/server/services/referral.service";
import { withErrorHandler } from "@/server/middleware";
import type { ApiResponse, Referral } from "@/types";

// GET /api/referral — get current user's code and referral stats
export const GET = withErrorHandler(async (_req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const code = getReferralCode(userId);
  const count = getReferralCount(userId);
  const referrals = getReferralsByUser(userId);

  return NextResponse.json<ApiResponse<{ code: string; count: number; referrals: Referral[] }>>({
    success: true,
    data: { code, count, referrals },
  });
});

// POST /api/referral — track a referral when a new user joins via invite link
export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Referral code is required" },
      { status: 400 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const referral = trackReferral(String(code), userId);

  if (!referral) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid referral code or self-referral" },
      { status: 400 }
    );
  }

  return NextResponse.json<ApiResponse<Referral>>({ success: true, data: referral }, { status: 201 });
});
