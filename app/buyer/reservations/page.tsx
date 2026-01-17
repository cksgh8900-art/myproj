import { Suspense } from "react";
import { getMyOrders } from "@/app/buyer/actions";
import { OrderCard } from "@/components/product/order-card";
import { EmptyOrders } from "@/components/product/empty-orders";

/**
 * 예약 내역 리스트 컴포넌트 (Server Component)
 */
async function OrderList() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

/**
 * 내 예약 내역 페이지
 *
 * 학생이 자신이 예약한 상품 목록을 조회하고 상태를 확인할 수 있는 페이지입니다.
 */
export default async function BuyerReservationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-1 border-b bg-background px-4 pb-3 pt-4">
        <h1 className="text-2xl font-bold">내 예약 내역</h1>
        <p className="text-sm text-muted-foreground">
          내가 예약한 마감 할인 상품의 내역을 확인할 수 있습니다
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              예약 내역을 불러오는 중...
            </p>
          </div>
        }
      >
        <OrderList />
      </Suspense>
    </div>
  );
}
