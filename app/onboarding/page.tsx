import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Store, GraduationCap } from "lucide-react";
import { updateUserRole } from "./actions";

/**
 * 역할 선택 페이지 (Onboarding)
 *
 * 회원가입 직후 사용자가 역할을 선택하는 페이지입니다.
 * - 사장님(Seller): 상품을 등록하고 관리하는 역할
 * - 학생(Buyer): 상품을 조회하고 예약하는 역할
 *
 * Mobile-First 디자인을 적용하여 모바일에서 최적화된 UI를 제공합니다.
 */
export default async function OnboardingPage() {
  // 인증 확인
  const { userId } = await auth();

  if (!userId) {
    // 로그인하지 않은 사용자는 홈으로 리다이렉트
    redirect("/");
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

        {/* 역할 선택 버튼 */}
        <div className="space-y-4">
          {/* 사장님 선택 */}
          <form action={updateUserRole.bind(null, "SELLER")}>
            <Button
              type="submit"
              className="w-full h-32 flex flex-col items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
              variant="default"
            >
              <Store className="w-8 h-8" />
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">사장님</span>
                <span className="text-sm font-normal opacity-90">
                  상품을 등록하고 관리합니다
                </span>
              </div>
            </Button>
          </form>

          {/* 학생 선택 */}
          <form action={updateUserRole.bind(null, "BUYER")}>
            <Button
              type="submit"
              className="w-full h-32 flex flex-col items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
              variant="outline"
            >
              <GraduationCap className="w-8 h-8" />
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">학생</span>
                <span className="text-sm font-normal opacity-90">
                  상품을 조회하고 예약합니다
                </span>
              </div>
            </Button>
          </form>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          역할 선택 후 서비스를 이용하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}

