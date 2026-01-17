import Link from "next/link";
import type { ProductData } from "@/app/buyer/actions";
import { cn } from "@/lib/utils";

/**
 * 피드용 상품 카드 컴포넌트
 *
 * 학생용 메인 피드에서 사용하는 상품 카드입니다.
 * 할인율을 빨간색으로 강조하고, 클릭 시 상품 상세 페이지로 이동합니다.
 */
export function FeedProductCard({ product }: { product: ProductData }) {
  const {
    id,
    name,
    original_price,
    discount_price,
    image_url,
    is_instant,
    pickup_deadline,
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
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <Link href={`/buyer/product/${id}`}>
      <div className="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
        {/* 이미지 영역 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image_url}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              이미지 없음
            </div>
          )}

          {/* 할인율 배지 (우상단) */}
          {hasDiscount && discountRate > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
              -{discountRate}%
            </div>
          )}

          {/* 바로 섭취 뱃지 (좌상단) */}
          {is_instant && (
            <div className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
              😋 바로 섭취
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="space-y-2 p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight">
              {name}
            </h3>

            {/* 가격 정보 */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                {discount_price.toLocaleString("ko-KR")}원
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {original_price.toLocaleString("ko-KR")}원
                  </span>
                </>
              )}
            </div>

            {/* 픽업 마감 시간 */}
            <p className="text-xs text-muted-foreground">
              픽업 마감: <span className="font-medium">{pickupLabel}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
