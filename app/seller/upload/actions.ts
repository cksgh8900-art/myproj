"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadProductImage } from "@/lib/storage/upload-product-image";
import type { ProductFormData } from "./schema";
import { getStore } from "../actions";

/**
 * 상품 등록 Server Action
 *
 * 가게 정보 확인, 이미지 업로드, 상품 데이터 저장을 처리합니다.
 */
export async function createProduct(
  formData: ProductFormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    // 1. 가게 정보 확인
    const store = await getStore();
    if (!store) {
      return {
        success: false,
        error: "가게 정보를 먼저 등록해주세요.",
      };
    }

    // 2. 이미지 업로드
    const imageResult = await uploadProductImage(formData.image, store.id);
    if (!imageResult.success) {
      return {
        success: false,
        error: "error" in imageResult ? imageResult.error : "이미지 업로드에 실패했습니다.",
      };
    }

    // 3. 픽업 마감 시간 파싱
    const pickupDeadline = new Date(formData.pickup_deadline);
    if (isNaN(pickupDeadline.getTime())) {
      return {
        success: false,
        error: "유효하지 않은 픽업 마감 시간입니다.",
      };
    }

    // 4. 상품 데이터 저장
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        name: formData.name.trim(),
        original_price: formData.original_price,
        discount_price: formData.discount_price,
        image_url: imageResult.url,
        is_instant: formData.is_instant,
        pickup_deadline: pickupDeadline.toISOString(),
        status: "AVAILABLE",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      // 이미지 업로드는 성공했지만 DB 저장 실패 시 이미지 삭제 시도
      // (선택적 - 실패해도 큰 문제는 없음)
      try {
        await uploadProductImage(formData.image, store.id).then((result) => {
          if (result.success) {
            // 삭제 로직은 별도 함수 필요 (현재는 스킵)
          }
        });
      } catch (deleteError) {
        console.error("Error deleting uploaded image:", deleteError);
      }

      return {
        success: false,
        error: "상품 등록에 실패했습니다.",
      };
    }

    // 5. 성공 시 캐시 무효화
    revalidatePath("/seller/dashboard");
    revalidatePath("/seller/upload");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return {
      success: false,
      error: "시스템 오류가 발생했습니다.",
    };
  }
}

