"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 역할 리다이렉트 프로바이더
 *
 * 회원가입 직후 또는 역할이 설정되지 않은 사용자를
 * `/onboarding` 페이지로 자동 리다이렉트합니다.
 *
 * 이 컴포넌트는 RootLayout에 추가되어 전역적으로 작동합니다.
 */
export function RoleRedirectProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이거나 사용자가 없으면 무시
    if (!isLoaded || !user) {
      return;
    }

    // 현재 경로 확인
    const currentPath = window.location.pathname;

    // onboarding 페이지나 로그인/회원가입 페이지는 리다이렉트하지 않음
    if (
      currentPath.startsWith("/onboarding") ||
      currentPath.startsWith("/sign-in") ||
      currentPath.startsWith("/sign-up")
    ) {
      return;
    }

    // publicMetadata에서 role 확인
    const role = user.publicMetadata?.role as string | undefined;

    // 역할이 설정되지 않았으면 onboarding으로 리다이렉트
    if (!role || (role !== "BUYER" && role !== "SELLER")) {
      router.push("/onboarding");
    }
  }, [isLoaded, user, router]);

  return <>{children}</>;
}

