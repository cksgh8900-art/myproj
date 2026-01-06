import Link from "next/link";
import { getStore, getMyProducts, type ProductData } from "../actions";
import { EmptyProducts } from "@/components/product/empty-products";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

/**
 * 사장님 대시보드 페이지
 *
 * 내 가게에 등록된 상품들을 조회하고,
 * 판매 완료 상태로 변경할 수 있는 페이지입니다.
 */
export default async function SellerDashboardPage() {
  const store = await getStore();

  // 가게 정보가 없는 경우: 가게 정보 등록 안내
  if (!store) {
    return (
      <div className="p-4 space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">내 상품 관리</h1>
          <p className="text-muted-foreground">
            상품을 관리하려면 먼저 가게 정보를 등록해야 합니다.
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            아직 가게 정보가 등록되지 않았습니다. 아래 버튼을 눌러 가게
            정보와 첫 상품을 등록해 보세요.
          </p>
          <Link href="/seller/upload">
            <Button className="w-full">가게 정보 등록하러 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const products: ProductData[] = await getMyProducts();

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">내 상품 관리</h1>
        <p className="text-muted-foreground">
          등록한 상품을 관리하고 판매 상태를 변경할 수 있습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          가게: <span className="font-medium">{store.name}</span>
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyProducts />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총 {products.length}개의 상품이 등록되어 있습니다.
            </p>
            <Link href="/seller/upload">
              <Button size="sm" variant="outline">
                상품 등록하기
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

