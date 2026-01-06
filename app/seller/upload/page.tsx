import { getStore } from "../actions";
import { StoreSetupForm } from "@/components/product/store-setup-form";
import { ProductUploadForm } from "./product-upload-form";

/**
 * 상품 등록 페이지
 *
 * 사장님이 상품을 등록하는 페이지입니다.
 * - 가게 정보 확인
 * - 가게 정보가 없으면 가게 정보 등록 폼 표시
 * - 가게 정보가 있으면 상품 등록 폼 표시
 */
export default async function SellerUploadPage() {
  const store = await getStore();

  // 가게 정보가 없으면 가게 정보 등록 폼 표시
  if (!store) {
    return (
      <div className="p-4 space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">상품 등록</h1>
          <p className="text-muted-foreground">
            상품을 등록하기 전에 가게 정보를 먼저 등록해주세요.
          </p>
        </div>
        <StoreSetupForm />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <p className="text-muted-foreground">
          새로운 상품을 등록하여 판매를 시작하세요.
        </p>
        <p className="text-sm text-muted-foreground">
          가게: {store.name}
        </p>
      </div>

      <ProductUploadForm storeId={store.id} />
    </div>
  );
}
