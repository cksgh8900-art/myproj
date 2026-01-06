"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 역할 업데이트 Server Action
 *
 * 사용자가 선택한 역할(BUYER 또는 SELLER)을 Clerk publicMetadata와
 * Supabase profiles 테이블에 동시에 업데이트합니다.
 *
 * @param role - 업데이트할 역할 ('BUYER' 또는 'SELLER')
 * @returns 성공 여부 및 에러 메시지
 */
export async function updateUserRole(role: "BUYER" | "SELLER") {
  try {
    // 1. 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    // 2. 역할 값 검증
    if (role !== "BUYER" && role !== "SELLER") {
      return {
        success: false,
        error: "유효하지 않은 역할입니다. 'BUYER' 또는 'SELLER'만 허용됩니다.",
      };
    }

    // 3. Clerk publicMetadata 업데이트
    const client = await clerkClient();
    try {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: role,
        },
      });
    } catch (clerkError) {
      console.error("Clerk metadata update error:", clerkError);
      return {
        success: false,
        error: "Clerk 메타데이터 업데이트에 실패했습니다.",
      };
    }

    // 4. Supabase profiles 테이블 업데이트
    const supabase = getServiceRoleClient();
    const { error: supabaseError } = await supabase
      .from("profiles")
      .update({ role: role })
      .eq("clerk_id", userId);

    if (supabaseError) {
      console.error("Supabase update error:", supabaseError);
      // Clerk는 이미 업데이트되었으므로 롤백 시도
      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: "BUYER", // 기본값으로 롤백
          },
        });
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }

      return {
        success: false,
        error: "데이터베이스 업데이트에 실패했습니다.",
      };
    }

    // 5. 성공 - 경로 재검증 및 리다이렉트
    revalidatePath("/");
    revalidatePath("/onboarding");

    // 역할에 따라 리다이렉트
    if (role === "SELLER") {
      redirect("/seller");
    } else {
      redirect("/");
    }
  } catch (error) {
    console.error("Update role error:", error);
    return {
      success: false,
      error: "시스템 오류가 발생했습니다.",
    };
  }
}

