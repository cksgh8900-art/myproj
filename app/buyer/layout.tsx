import type { ReactNode } from "react";
import { BuyerBottomNav } from "@/components/navigation/buyer-bottom-nav";

/**
 * 사용자(학생) 전용 레이아웃
 *
 * `(buyer)` 그룹 하위의 모든 페이지에 공통으로 적용됩니다.
 * - 하단에 Buyer 전용 네비게이션 바 표시
 * - 상단 Navbar는 `app/layout.tsx`에서 이미 렌더링됨
 */
export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="pb-4">{children}</div>
      <BuyerBottomNav />
    </div>
  );
}

