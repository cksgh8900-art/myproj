"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Store, GraduationCap, Loader2 } from "lucide-react";
import { updateUserRole } from "./actions";

/**
 * 역할 선택 페이지 (Onboarding)
 *
 * 회원가입 직후 사용자가 역할을 선택하는 페이지입니다.
 * - 사장님(Seller): 상품을 등록하고 관리하는 역할
 * - 학생(Buyer): 상품을 조회하고 예약하는 역할
 *
 * 중요: 역할 업데이트 후 Clerk 세션을 갱신하고 하드 리프레시를 수행해야
 * 서버 측에서 새 역할을 인식합니다.
 *
 * Mobile-First 디자인을 적용하여 모바일에서 최적화된 UI를 제공합니다.
 */
export default function OnboardingPage() {
  const { isLoaded, user } = useUser();
  const { session } = useClerk();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<"SELLER" | "BUYER" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 이미 역할이 설정된 사용자는 적절한 페이지로 리다이렉트
  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role as string | undefined;
      if (role === "SELLER") {
        router.push("/seller");
      } else if (role === "BUYER") {
        router.push("/");
      }
    }
  }, [isLoaded, user, router]);

  // 로그인하지 않은 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  const handleSelectRole = async (role: "SELLER" | "BUYER") => {
    setIsSubmitting(role);
    setError(null);

    try {
      console.log("🔄 역할 선택:", role);

      // Server Action 호출
      const result = await updateUserRole(role);

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
      window.location.href = result.redirectTo || "/";
    } catch (err) {
      console.error("❌ 역할 선택 오류:", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setIsSubmitting(null);
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

  // 로그인하지 않은 경우
  if (!user) {
    return null;
  }

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
            onClick={() => handleSelectRole("SELLER")}
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
            onClick={() => handleSelectRole("BUYER")}
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
          역할 선택 후 서비스를 이용하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}

