"use server";

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
