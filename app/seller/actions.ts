"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 가게 정보 타입
 */
export type StoreData = {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
};

/**
 * 상품 정보 타입
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
 * 현재 사용자의 가게 정보를 조회합니다.
 *
 * @returns 가게 정보 또는 null (가게 정보가 없는 경우)
 */
export async function getStore(): Promise<StoreData | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", userId)
      .single();

    if (error) {
      // 가게 정보가 없는 경우 (PGRST116: no rows returned)
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching store:", error);
      return null;
    }

    return data as StoreData;
  } catch (error) {
    console.error("Error in getStore:", error);
    return null;
  }
}

/**
 * 가게 정보를 생성합니다.
 *
 * @param name - 가게 이름 (필수)
 * @param address - 가게 주소 (선택)
 * @param phone - 가게 전화번호 (선택)
 * @returns 생성된 가게 정보 또는 에러
 */
export async function createStore(
  name: string,
  address?: string,
  phone?: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    // 가게 이름 검증
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: "가게 이름을 입력해주세요.",
      };
    }

    // 이미 가게 정보가 있는지 확인
    const existingStore = await getStore();
    if (existingStore) {
      return {
        success: false,
        error: "이미 가게 정보가 등록되어 있습니다.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stores")
      .insert({
        owner_id: userId,
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating store:", error);
      return {
        success: false,
        error: "가게 정보 등록에 실패했습니다.",
      };
    }

    revalidatePath("/seller");
    revalidatePath("/seller/upload");

    return {
      success: true,
      store: data as StoreData,
    };
  } catch (error) {
    console.error("Error in createStore:", error);
    return {
      success: false,
      error: "시스템 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 사장님의 가게에 등록된 상품 리스트를 조회합니다.
 */
export async function getMyProducts(): Promise<ProductData[]> {
  try {
    const store = await getStore();

    if (!store) {
      return [];
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return (data ?? []) as ProductData[];
  } catch (error) {
    console.error("Error in getMyProducts:", error);
    return [];
  }
}

/**
 * 상품 상태를 업데이트합니다.
 *
 * 현재는 판매 완료(SOLD) 처리에만 사용합니다.
 */
export async function updateProductStatus(
  productId: string,
  newStatus: "SOLD"
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    const store = await getStore();

    if (!store) {
      return {
        success: false,
        error: "가게 정보가 없습니다.",
      };
    }

    const supabase = await createClient();

    // 내 가게의 상품인지 확인하면서 상태 업데이트
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", productId)
      .eq("store_id", store.id);

    if (error) {
      console.error("Error updating product status:", error);
      return {
        success: false,
        error: "상품 상태 변경에 실패했습니다.",
      };
    }

    revalidatePath("/seller/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in updateProductStatus:", error);
    return {
      success: false,
      error: "시스템 오류가 발생했습니다.",
    };
  }
}
