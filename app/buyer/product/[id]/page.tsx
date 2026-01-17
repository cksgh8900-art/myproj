import { notFound } from "next/navigation";
import { getProductById } from "@/app/buyer/actions";
import { ReserveButton } from "@/components/product/reserve-button";
import { cn } from "@/lib/utils";

/**
 * 상품 상세 페이지
 *
 * 학생이 상품을 클릭하여 상세 정보를 확인하고 예약할 수 있는 페이지입니다.
 */
export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const productId = params.id;

  // 상품 정보 조회
  const product = await getProductById(productId);

  // 상품이 없으면 404 페이지 표시
  if (!product) {
    notFound();
  }

  const {
    name,
    original_price,
    discount_price,
    image_url,
    is_instant,
    pickup_deadline,
    status,
    store,
  } = product;

  const hasDiscount =
    original_price > 0 && discount_price > 0 && discount_price < original_price;

  const discountRate = hasDiscount
    ? Math.round(((original_price - discount_price) / original_price) * 100)
    : 0;

  const pickupDate = new Date(pickup_deadline);
  const pickupLabel = isNaN(pickupDate.getTime())
    ? "-"
    : pickupDate.toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const isAvailable = status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 이미지 영역 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            이미지 없음
          </div>
        )}

        {/* 할인율 배지 */}
        {hasDiscount && discountRate > 0 && (
          <div className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 text-lg font-bold text-white shadow-lg">
            -{discountRate}%
          </div>
        )}

        {/* 바로 섭취 뱃지 */}
        {is_instant && (
          <div className="absolute left-4 top-4 rounded-full bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
            😋 바로 섭취
          </div>
        )}

        {/* 상태 뱃지 */}
        {!isAvailable && (
          <div
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg",
              status === "RESERVED" && "bg-amber-500",
              status === "SOLD" && "bg-gray-600"
            )}
          >
            {status === "RESERVED" ? "예약됨" : "판매완료"}
          </div>
        )}
      </div>

      {/* 상품 정보 영역 */}
      <div className="space-y-4 px-4 py-6">
        {/* 상품명 */}
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
        </div>

        {/* 가격 정보 */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            {discount_price.toLocaleString("ko-KR")}원
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {original_price.toLocaleString("ko-KR")}원
              </span>
            </>
          )}
        </div>

        {/* 픽업 마감 시간 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              픽업 마감 시간
            </p>
            <p className="text-base font-semibold">{pickupLabel}</p>
          </div>
        </div>

        {/* 가게 정보 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">가게 정보</p>
            <div className="space-y-1">
              <p className="text-base font-semibold">{store.name}</p>
              {store.address && (
                <p className="text-sm text-muted-foreground">{store.address}</p>
              )}
              {store.phone && (
                <p className="text-sm text-muted-foreground">전화: {store.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 예약 버튼 (하단 고정) */}
      {isAvailable && (
        <div className="fixed bottom-20 left-0 right-0 z-10 border-t bg-background px-4 py-4">
          <ReserveButton productId={productId} />
        </div>
      )}

      {!isAvailable && (
        <div className="px-4 pb-6">
          <div className="rounded-lg border bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {status === "RESERVED"
                ? "이미 예약된 상품입니다"
                : "판매가 완료된 상품입니다"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
