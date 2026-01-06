/**
 * 사장님 대시보드 페이지 (임시)
 *
 * 내 상품 관리 페이지입니다.
 * Phase 2-3에서 실제 기능이 구현될 예정입니다.
 *
 * 예정된 기능:
 * - 내 가게의 상품 리스트 조회
 * - 상품 상태 변경 (판매 완료 처리)
 */
export default function SellerDashboardPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">내 상품 관리</h1>
        <p className="text-muted-foreground">
          등록한 상품을 관리하고 판매 상태를 변경할 수 있습니다.
        </p>
      </div>

      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p>상품 관리 기능은 Phase 2-3에서 구현될 예정입니다.</p>
      </div>
    </div>
  );
}

