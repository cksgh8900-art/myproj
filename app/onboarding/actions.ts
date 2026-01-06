"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 역할 업데이트 Server Action
 *
 * 사용자가 선택한 역할(BUYER 또는 SELLER)을 Clerk publicMetadata와
 * Supabase profiles 테이블에 동시에 업데이트합니다.
 *
 * 중요: Clerk publicMetadata 업데이트 후 세션 토큰이 갱신되어야
 * 서버 측에서 새 역할을 인식합니다. 클라이언트에서 세션을 갱신하거나
 * 페이지를 하드 리프레시해야 합니다.
 *
 * @param role - 업데이트할 역할 ('BUYER' 또는 'SELLER')
 * @returns 성공 여부, 역할, 리다이렉트 경로
 */
export async function updateUserRole(role: "BUYER" | "SELLER") {
  try {
    console.group("🔄 updateUserRole 시작");
    console.log("선택된 역할:", role);

    // 1. 인증 확인
    const { userId } = await auth();
    console.log("사용자 ID:", userId);

    if (!userId) {
      console.error("❌ 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
        redirectTo: null,
      };
    }

    // 2. 역할 값 검증
    if (role !== "BUYER" && role !== "SELLER") {
      console.error("❌ 유효하지 않은 역할:", role);
      console.groupEnd();
      return {
        success: false,
        error: "유효하지 않은 역할입니다. 'BUYER' 또는 'SELLER'만 허용됩니다.",
        redirectTo: null,
      };
    }

    // 3. Clerk publicMetadata 업데이트
    console.log("📝 Clerk publicMetadata 업데이트 시작...");
    const client = await clerkClient();
    try {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: role,
        },
      });
      console.log("✅ Clerk publicMetadata 업데이트 완료");
    } catch (clerkError) {
      console.error("❌ Clerk metadata update error:", clerkError);
      console.groupEnd();
      return {
        success: false,
        error: "Clerk 메타데이터 업데이트에 실패했습니다.",
        redirectTo: null,
      };
    }

    // 4. Supabase profiles 테이블 upsert (없으면 생성, 있으면 업데이트)
    console.log("📝 Supabase profiles 테이블 업데이트 시작...");
    const supabase = getServiceRoleClient();

    // Clerk에서 사용자 정보 가져오기
    const clerkUser = await client.users.getUser(userId);
    const nickname =
      clerkUser.fullName ||
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    const { data, error: supabaseError } = await supabase
      .from("profiles")
      .upsert(
        {
          clerk_id: userId,
          role: role,
          nickname: nickname,
        },
        {
          onConflict: "clerk_id",
        }
      )
      .select()
      .single();

    if (supabaseError) {
      console.error("❌ Supabase upsert error:", supabaseError);
      // Clerk는 이미 업데이트되었으므로 롤백 시도
      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: "BUYER", // 기본값으로 롤백
          },
        });
      } catch (rollbackError) {
        console.error("❌ Rollback error:", rollbackError);
      }
      console.groupEnd();
      return {
        success: false,
        error: "데이터베이스 업데이트에 실패했습니다.",
        redirectTo: null,
      };
    }

    console.log("✅ Supabase profiles 업데이트 완료:", data);

    // 5. 성공 - 경로 재검증
    revalidatePath("/");
    revalidatePath("/onboarding");
    revalidatePath("/seller");

    // 리다이렉트 경로 반환 (클라이언트에서 하드 리프레시로 이동)
    const redirectTo = role === "SELLER" ? "/seller" : "/";
    console.log("🚀 리다이렉트 경로:", redirectTo);
    console.groupEnd();

    return {
      success: true,
      role: role,
      redirectTo: redirectTo,
    };
  } catch (error) {
    console.error("❌ Update role error:", error);
    console.groupEnd();
    return {
      success: false,
      error: "시스템 오류가 발생했습니다.",
      redirectTo: null,
    };
  }
}

