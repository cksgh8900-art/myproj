"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 상품 정보 타입 (seller와 동일하게 재사용)
 */
export type ProductData = {
  id: string;
  store_id: string;
  name: string;
  original_price: number;
  discount_price: number;
  image_url: string | null;
  is_instant: boolean;
  pickup_deadline: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  created_at: string;
};

/**
 * 필터 옵션 타입
 */
export type FilterOptions = {
  is_instant?: boolean; // 바로 섭취 필터 (true: 바로섭취, false: 조리용)
  max_price?: number; // 만원 이하 필터
};

/**
 * 가게 정보 타입
 */
export type StoreData = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
};

/**
 * 상품 상세 정보 타입 (가게 정보 포함)
 */
export type ProductDetailData = ProductData & {
  store: StoreData;
};

/**
 * 예약 결과 타입
 */
export type ReserveProductResult =
  | { success: true; order_id: string }
  | { success: false; message: string };

/**
 * 예약 내역 정보 타입 (order + product + store)
 */
export type OrderData = {
  // Order 정보
  id: string;
  buyer_id: string;
  product_id: string;
  status: "RESERVED" | "COMPLETED" | "CANCELED";
  created_at: string;

  // Product 정보 (조인)
  product: {
    id: string;
    name: string;
    original_price: number;
    discount_price: number;
    image_url: string | null;
    is_instant: boolean;
    pickup_deadline: string;
  };

  // Store 정보 (조인)
  store: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
  };
};

/**
 * 판매 가능한 상품 리스트를 조회합니다.
 *
 * @param filter - 필터 옵션 (선택)
 * @returns 판매 가능한 상품 리스트
 */
export async function getAvailableProducts(
  filter?: FilterOptions
): Promise<ProductData[]> {
  try {
    const supabase = await createClient();

    // 기본 조건: status = 'AVAILABLE'이고 픽업 마감 시간이 현재보다 미래인 상품
    const now = new Date().toISOString();
    let query = supabase
      .from("products")
      .select("*")
      .eq("status", "AVAILABLE")
      .gt("pickup_deadline", now);

    // 필터 적용
    if (filter?.is_instant !== undefined) {
      query = query.eq("is_instant", filter.is_instant);
    }

    if (filter?.max_price !== undefined) {
      query = query.lte("discount_price", filter.max_price);
    }

    // 최신순 정렬
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching available products:", error);
      return [];
    }

    return (data ?? []) as ProductData[];
  } catch (error) {
    console.error("Error in getAvailableProducts:", error);
    return [];
  }
}

/**
 * 상품 ID로 상품 상세 정보를 조회합니다.
 *
 * @param productId - 상품 ID
 * @returns 상품 상세 정보 (가게 정보 포함) 또는 null
 */
export async function getProductById(
  productId: string
): Promise<ProductDetailData | null> {
  try {
    const supabase = await createClient();

    // products 테이블과 stores 테이블 조인하여 조회
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        stores (
          id,
          name,
          address,
          phone
        )
      `
      )
      .eq("id", productId)
      .single();

    if (error) {
      // 상품이 없는 경우 (PGRST116: no rows returned)
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching product:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // 타입 변환 (stores가 배열로 반환되므로 첫 번째 요소 사용)
    const product = data as any;
    const store = Array.isArray(product.stores)
      ? product.stores[0]
      : product.stores;

    if (!store) {
      console.error("Store not found for product:", productId);
      return null;
    }

    return {
      id: product.id,
      store_id: product.store_id,
      name: product.name,
      original_price: product.original_price,
      discount_price: product.discount_price,
      image_url: product.image_url,
      is_instant: product.is_instant,
      pickup_deadline: product.pickup_deadline,
      status: product.status,
      created_at: product.created_at,
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
      },
    } as ProductDetailData;
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
}

/**
 * 상품을 예약합니다.
 *
 * @param productId - 예약할 상품 ID
 * @returns 예약 결과
 */
export async function reserveProduct(
  productId: string
): Promise<ReserveProductResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = await createClient();

    // Supabase RPC 함수 호출
    const { data, error } = await supabase.rpc("reserve_product", {
      p_product_id: productId,
      p_buyer_id: userId,
    });

    if (error) {
      console.error("Error reserving product:", error);
      return {
        success: false,
        message: "예약 처리 중 오류가 발생했습니다.",
      };
    }

    // RPC 함수는 JSON을 반환하므로 파싱 필요
    const result = data as { success: boolean; message?: string; order_id?: string };

    if (!result.success) {
      return {
        success: false,
        message: result.message || "예약에 실패했습니다.",
      };
    }

    // 경로 revalidate 처리
    revalidatePath("/buyer");
    revalidatePath(`/buyer/product/${productId}`);

    return {
      success: true,
      order_id: result.order_id || "",
    };
  } catch (error) {
    console.error("Error in reserveProduct:", error);
    return {
      success: false,
      message: "시스템 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 사용자의 예약 내역을 조회합니다.
 *
 * @returns 예약 내역 리스트 (order + product + store 정보 포함)
 */
export async function getMyOrders(): Promise<OrderData[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    const supabase = await createClient();

    // orders 테이블에서 products와 stores를 조인하여 조회
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        products (
          id,
          name,
          original_price,
          discount_price,
          image_url,
          is_instant,
          pickup_deadline,
          stores (
            id,
            name,
            address,
            phone
          )
        )
      `
      )
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // 타입 변환 (products와 stores가 배열로 반환될 수 있으므로 처리)
    return data.map((order: any) => {
      const product = Array.isArray(order.products)
        ? order.products[0]
        : order.products;
      const store = product?.stores
        ? Array.isArray(product.stores)
          ? product.stores[0]
          : product.stores
        : null;

      if (!product || !store) {
        console.error("Product or store not found for order:", order.id);
        return null;
      }

      return {
        id: order.id,
        buyer_id: order.buyer_id,
        product_id: order.product_id,
        status: order.status,
        created_at: order.created_at,
        product: {
          id: product.id,
          name: product.name,
          original_price: product.original_price,
          discount_price: product.discount_price,
          image_url: product.image_url,
          is_instant: product.is_instant,
          pickup_deadline: product.pickup_deadline,
        },
        store: {
          id: store.id,
          name: store.name,
          address: store.address,
          phone: store.phone,
        },
      } as OrderData;
    }).filter((order): order is OrderData => order !== null);
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    return [];
  }
}
