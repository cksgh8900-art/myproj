import Link from "next/link";
import type { OrderData } from "@/app/buyer/actions";
import { cn } from "@/lib/utils";

/**
 * 예약 내역 카드 컴포넌트
 *
 * 내 예약 내역 페이지에서 사용하는 예약 내역 카드입니다.
 * 상품 정보, 가게 정보, 예약 상태를 표시합니다.
 */
export function OrderCard({ order }: { order: OrderData }) {
  const {
    id,
    status,
    created_at,
    product,
    store,
  } = order;

  const { name, discount_price, image_url, pickup_deadline } = product;

  const statusLabelMap: Record<OrderData["status"], string> = {
    RESERVED: "예약중",
    COMPLETED: "픽업완료",
    CANCELED: "취소됨",
  };

  const statusClassMap: Record<OrderData["status"], string> = {
    RESERVED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-gray-200 text-gray-600",
    CANCELED: "bg-red-100 text-red-700",
  };

  const orderDate = new Date(created_at);
  const orderLabel = isNaN(orderDate.getTime())
    ? "-"
    : orderDate.toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

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
    <Link href={`/buyer/product/${product.id}`}>
      <div className="group flex gap-4 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
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
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                  statusClassMap[status]
                )}
              >
                {statusLabelMap[status]}
              </span>
            </div>

            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-bold">
                {discount_price.toLocaleString("ko-KR")}원
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              가게: <span className="font-medium">{store.name}</span>
            </p>

            <p className="text-xs text-muted-foreground">
              예약일: <span className="font-medium">{orderLabel}</span>
            </p>

            <p className="text-xs text-muted-foreground">
              픽업 마감: <span className="font-medium">{pickupLabel}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
