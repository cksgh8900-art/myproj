import { MarkAsSoldButton } from "./mark-as-sold-button";
import type { ProductData } from "@/app/seller/actions";
import { cn } from "@/lib/utils";

/**
 * 사장님 대시보드에서 사용하는 상품 카드
 */
export function ProductCard({ product }: { product: ProductData }) {
  const {
    name,
    original_price,
    discount_price,
    image_url,
    is_instant,
    pickup_deadline,
    status,
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

  const isSold = status === "SOLD";

  const statusLabelMap: Record<ProductData["status"], string> = {
    AVAILABLE: "판매중",
    RESERVED: "예약중",
    SOLD: "판매완료",
  };

  const statusClassMap: Record<ProductData["status"], string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700",
    RESERVED: "bg-amber-100 text-amber-700",
    SOLD: "bg-gray-200 text-gray-600",
  };

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-3 shadow-sm">
      {/* 이미지 영역 */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            이미지 없음
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="line-clamp-1 text-sm font-semibold">{name}</p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                statusClassMap[status]
              )}
            >
              {statusLabelMap[status]}
            </span>
            {is_instant && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                바로 섭취
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-bold">
              {discount_price.toLocaleString("ko-KR")}원
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {original_price.toLocaleString("ko-KR")}원
                </span>
                <span className="text-xs font-semibold text-red-600">
                  -{discountRate}%
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            픽업 마감: <span className="font-medium">{pickupLabel}</span>
          </p>
        </div>

        <div className="flex items-center justify-end">
          <MarkAsSoldButton productId={product.id} disabled={isSold} />
        </div>
      </div>
    </div>
  );
}

