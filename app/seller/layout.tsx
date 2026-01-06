import { redirect } from "next/navigation";
import { isSeller, getUserRole } from "@/lib/auth/role";
import { SellerBottomNav } from "@/components/navigation/seller-bottom-nav";

/**
 * 사장님 전용 레이아웃
 *
 * `/seller/*` 경로의 모든 페이지에 적용되는 레이아웃입니다.
 * Middleware에서 이미 보호되고 있지만, 추가 보안 레이어로 역할을 확인합니다.
 *
 * 주요 기능:
 * - 역할 확인 (SELLER만 접근 가능)
 * - 하단 네비게이션 바 포함
 * - Mobile-First 디자인 (하단 네비게이션 바 고정)
 */
export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 추가 보안 레이어: SELLER 역할 확인
  const role = await getUserRole();
  const seller = role === "SELLER";

  console.log("🏪 SellerLayout - 역할 확인:", role, "isSeller:", seller);

  if (!seller) {
    // SELLER가 아니면 홈으로 리다이렉트
    console.log("🚫 SellerLayout - SELLER가 아님, 홈으로 리다이렉트");
    redirect("/");
  }

  console.log("✅ SellerLayout - SELLER 확인됨, 레이아웃 렌더링");

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* 메인 컨텐츠 */}
      <div className="pb-4">{children}</div>

      {/* 하단 네비게이션 바 */}
      <SellerBottomNav />
    </div>
  );
}

