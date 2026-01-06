import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * RBAC (Role-Based Access Control) 미들웨어
 *
 * 역할 기반 경로 보호를 구현합니다:
 * - `/seller/*`: 오직 role === 'SELLER'인 유저만 접근 가능
 * - 위반 시 `/` (홈)으로 리다이렉트
 * - 로그인하지 않은 사용자는 Clerk가 자동으로 로그인 페이지로 리다이렉트
 *
 * @see https://clerk.com/docs/references/nextjs/clerk-middleware
 */
export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 보호할 경로 패턴
  const isSellerRoute = createRouteMatcher(["/seller(.*)"]);

  // `/seller/*` 경로 접근 시 역할 확인
  if (isSellerRoute(req)) {
    // 로그인하지 않은 사용자는 Clerk가 자동으로 로그인 페이지로 리다이렉트
    if (!userId) {
      return; // Clerk가 자동 처리
    }

    // publicMetadata에서 role 확인
    // sessionClaims의 구조: { publicMetadata: { role: 'SELLER' | 'BUYER' } }
    const role = (sessionClaims?.publicMetadata?.role as string) || null;

    // SELLER 역할이 아니면 홈으로 리다이렉트
    if (role !== "SELLER") {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
