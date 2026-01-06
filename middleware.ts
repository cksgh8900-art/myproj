import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * RBAC (Role-Based Access Control) 미들웨어
 *
 * 역할 기반 경로 보호를 구현합니다:
 * - `/seller/*`: 오직 role === 'SELLER'인 유저만 접근 가능
 * - 위반 시 `/` (홈)으로 리다이렉트
 * - 로그인하지 않은 사용자는 Clerk가 자동으로 로그인 페이지로 리다이렉트
 *
 * 중요: sessionClaims 대신 직접 Clerk API를 호출해서 최신 역할을 확인합니다.
 * sessionClaims는 JWT 토큰에서 읽는 값이므로, publicMetadata 업데이트 후
 * 세션 토큰이 갱신될 때까지 이전 값이 반환될 수 있습니다.
 *
 * @see https://clerk.com/docs/references/nextjs/clerk-middleware
 */
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 보호할 경로 패턴
  const isSellerRoute = createRouteMatcher(["/seller(.*)"]);

  // `/seller/*` 경로 접근 시 역할 확인
  if (isSellerRoute(req)) {
    // 로그인하지 않은 사용자는 Clerk가 자동으로 로그인 페이지로 리다이렉트
    if (!userId) {
      return; // Clerk가 자동 처리
    }

    // 직접 Clerk API를 호출해서 최신 역할 확인
    // (sessionClaims는 JWT 토큰에서 읽으므로 업데이트가 늦게 반영될 수 있음)
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata?.role as string | undefined;

      console.log("🔐 Middleware - userId:", userId, "role:", role);

      // SELLER 역할이 아니면 홈으로 리다이렉트
      if (role !== "SELLER") {
        console.log("🚫 Middleware - SELLER가 아님, 홈으로 리다이렉트");
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      console.log("✅ Middleware - SELLER 확인됨");
    } catch (error) {
      console.error("❌ Middleware - Clerk API 호출 오류:", error);
      // 오류 발생 시 안전하게 홈으로 리다이렉트
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
