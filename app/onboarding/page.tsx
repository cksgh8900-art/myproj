"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Store, GraduationCap, Loader2 } from "lucide-react";
import { updateUserRole } from "./actions";

/**
 * 역할 선택 페이지 (Onboarding)
 *
 * 로그인 전 또는 로그인 후 역할이 설정되지 않은 사용자가
 * 역할을 선택하는 페이지입니다.
 * - 사장님(Seller): 로그인 모달 열기 → 로그인 후 SELLER 역할 설정
 * - 학생(Buyer): 로그인 없이 바로 학생 페이지로 이동
 *
 * 중요: 역할 업데이트 후 Clerk 세션을 갱신하고 하드 리프레시를 수행해야
 * 서버 측에서 새 역할을 인식합니다.
 *
 * Mobile-First 디자인을 적용하여 모바일에서 최적화된 UI를 제공합니다.
 */
export default function OnboardingPage() {
  const { isLoaded, user } = useUser();
  const { session, openSignIn } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState<"SELLER" | "BUYER" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 이미 역할이 설정된 사용자는 적절한 페이지로 리다이렉트
  useEffect(() => {
    const roleParam = searchParams.get("role");
    
    // 쿼리 파라미터가 있으면 역할 설정 중이므로 리다이렉트하지 않음
    if (roleParam) {
      console.log("⏸️ 역할 설정 중 (쿼리 파라미터 존재) - 리다이렉트 스킵");
      return;
    }
    
    if (isLoaded && user) {
      const role = user.publicMetadata?.role as string | undefined;
      if (role === "SELLER") {
        console.log("✅ SELLER 역할 확인 -> /seller로 리다이렉트");
        router.push("/seller");
      } else if (role === "BUYER") {
        console.log("✅ BUYER 역할 확인 -> /buyer로 리다이렉트");
        router.push("/buyer");
      }
    }
  }, [isLoaded, user, router, searchParams]);

  // SELLER 역할 설정
  const handleSetSellerRole = async () => {
    setIsSubmitting("SELLER");
    setError(null);

    try {
      console.log("🔄 SELLER 역할 설정 시작");

      // Server Action 호출
      const result = await updateUserRole("SELLER");

      if (!result.success) {
        setError(result.error || "역할 업데이트에 실패했습니다.");
        setIsSubmitting(null);
        return;
      }

      console.log("✅ 역할 업데이트 성공:", result);

      // Clerk 세션 갱신 (토큰 새로 발급)
      if (session) {
        console.log("🔄 Clerk 세션 갱신 중...");
        await session.reload();
        console.log("✅ Clerk 세션 갱신 완료");
      }

      // 하드 리프레시로 페이지 이동 (서버 측에서 새 세션 토큰 사용)
      console.log("🚀 하드 리프레시:", result.redirectTo);
      window.location.href = result.redirectTo || "/seller";
    } catch (err) {
      console.error("❌ 역할 선택 오류:", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setIsSubmitting(null);
    }
  };

  // 로그인 후 SELLER 역할 설정 (쿼리 파라미터로 확인)
  useEffect(() => {
    const roleParam = searchParams.get("role");
    
    console.log("🔍 로그인 후 역할 설정 체크:", {
      roleParam,
      isLoaded,
      hasUser: !!user,
      currentRole: user?.publicMetadata?.role,
    });
    
    // 쿼리 파라미터가 SELLER이고, 로그인 상태이고, 역할이 아직 설정되지 않은 경우
    if (roleParam === "SELLER" && isLoaded && user) {
      const currentRole = user.publicMetadata?.role as string | undefined;
      
      // 역할이 이미 SELLER로 설정되어 있으면 바로 리다이렉트
      if (currentRole === "SELLER") {
        console.log("✅ 이미 SELLER 역할 설정됨 -> /seller로 리다이렉트");
        window.location.href = "/seller";
        return;
      }
      
      // 역할이 아직 설정되지 않았으면 SELLER로 설정
      if (!currentRole || currentRole !== "SELLER") {
        console.log("🚀 SELLER 역할 설정 시작 (쿼리 파라미터)");
        // 약간의 지연을 주어 user 객체가 완전히 로드될 때까지 기다림
        const timer = setTimeout(() => {
          handleSetSellerRole();
        }, 200);
        
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, searchParams]);

  // 학생 버튼: 로그인 없이 바로 학생 페이지로 이동
  const handleBuyerClick = () => {
    console.log("🎓 학생 버튼 클릭 -> /buyer 로 이동");
    router.push("/buyer");
  };

  // 사장님 버튼: 로그인 모달 열기 또는 역할 설정
  const handleSellerClick = async () => {
    if (!user) {
      // 로그인하지 않은 경우 로그인 모달 열기
      console.log("🏪 사장님 버튼 클릭 -> 로그인 모달 열기");
      openSignIn({
        afterSignInUrl: "/onboarding?role=SELLER", // 로그인 후 돌아올 URL
      });
    } else {
      // 이미 로그인한 경우 역할 설정
      await handleSetSellerRole();
    }
  };

  // 로딩 중
  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 로그인하지 않은 사용자도 페이지 표시 (역할 선택 UI 제공)

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">역할을 선택해주세요</h1>
          <p className="text-gray-600 dark:text-gray-400">
            서비스를 이용하기 위해 역할을 선택해주세요.
            <br />
            나중에 변경할 수 있습니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* 역할 선택 버튼 */}
        <div className="space-y-4">
          {/* 사장님 선택 */}
          <Button
            type="button"
            onClick={handleSellerClick}
            disabled={isSubmitting !== null}
            className="w-full h-32 flex flex-col items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
            variant="default"
          >
            {isSubmitting === "SELLER" ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Store className="w-8 h-8" />
            )}
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">사장님</span>
              <span className="text-sm font-normal opacity-90">
                상품을 등록하고 관리합니다
              </span>
            </div>
          </Button>

          {/* 학생 선택 */}
          <Button
            type="button"
            onClick={handleBuyerClick}
            disabled={isSubmitting !== null}
            className="w-full h-32 flex flex-col items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
            variant="outline"
          >
            {isSubmitting === "BUYER" ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <GraduationCap className="w-8 h-8" />
            )}
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">학생</span>
              <span className="text-sm font-normal opacity-90">
                상품을 조회하고 예약합니다
              </span>
            </div>
          </Button>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {user
            ? "역할 선택 후 서비스를 이용하실 수 있습니다."
            : "학생은 로그인 없이 이용할 수 있고, 사장님은 로그인이 필요합니다."}
        </p>
      </div>
    </div>
  );
}

