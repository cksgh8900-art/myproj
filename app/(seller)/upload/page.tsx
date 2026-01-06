/**
 * 상품 등록 페이지 (임시)
 *
 * 사장님이 상품을 등록하는 페이지입니다.
 * Phase 2-2에서 실제 기능이 구현될 예정입니다.
 *
 * 예정된 기능:
 * - 이미지 업로드 (Supabase Storage)
 * - 메뉴명, 정가, 할인가, 픽업 시간 입력
 * - 상품 정보를 products 테이블에 저장
 */
export default function SellerUploadPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <p className="text-muted-foreground">
          새로운 상품을 등록하여 판매를 시작하세요.
        </p>
      </div>

      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p>상품 등록 기능은 Phase 2-2에서 구현될 예정입니다.</p>
      </div>
    </div>
  );
}

