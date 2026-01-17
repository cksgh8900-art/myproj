import { Suspense } from "react";
import { FeedFilterTabs } from "@/components/product/feed-filter-tabs";
import { FeedProductCard } from "@/components/product/feed-product-card";
import { EmptyFeed } from "@/components/product/empty-feed";
import { getAvailableProducts } from "@/app/buyer/actions";
import type { FilterOptions } from "@/app/buyer/actions";

/**
 * 상품 리스트 컴포넌트 (Server Component)
 */
async function ProductList({ filter }: { filter?: FilterOptions }) {
  const products = await getAvailableProducts(filter);

  if (products.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 px-4 py-4">
      {products.map((product) => (
        <FeedProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/**
 * 학생용 메인 피드 페이지
 *
 * 주변 가게의 마감 할인 상품을 조회하고 필터링할 수 있는 화면입니다.
 */
export default async function BuyerHomePage(props: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filterParam = searchParams.filter;

  // URL 쿼리 파라미터를 FilterOptions로 변환
  let filter: FilterOptions | undefined;
  if (filterParam === "instant") {
    filter = { is_instant: true };
  } else if (filterParam === "cook") {
    filter = { is_instant: false };
  } else if (filterParam === "budget") {
    filter = { max_price: 10000 };
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-1 border-b bg-background px-4 pb-3 pt-4">
        <h1 className="text-2xl font-bold">마감 할인 상품</h1>
        <p className="text-sm text-muted-foreground">
          주변 가게의 마감 할인 상품을 한눈에 볼 수 있습니다
        </p>
      </div>

      <FeedFilterTabs />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">상품을 불러오는 중...</p>
          </div>
        }
      >
        <ProductList filter={filter} />
      </Suspense>
    </div>
  );
}
