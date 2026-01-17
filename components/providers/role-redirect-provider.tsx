"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // 이미 리다이렉트 했으면 무시
    if (hasRedirected.current) {
      return;
    }

    console.group("🔍 RoleRedirectProvider 체크");
    console.log("isLoaded:", isLoaded);
    console.log("user:", user ? user.id : null);
    console.log("pathname:", pathname);

    // 리다이렉트 제외 경로
    const excludedPaths = [
      "/onboarding",
      "/sign-in",
      "/sign-up",
      "/api/",
      "/buyer", // 학생 페이지는 로그인 없이 접근 가능
    ];

    const isExcludedPath = excludedPaths.some((path) => pathname.startsWith(path));
    if (isExcludedPath) {
      console.log("🚫 리다이렉트 제외 경로:", pathname);
      console.groupEnd();
      return;
    }

    // 로딩 중이면 무시
    if (!isLoaded) {
      console.log("⏳ 로딩 중...");
      console.groupEnd();
      return;
    }

    // 로그인하지 않은 사용자도 onboarding으로 리다이렉트
    if (!user) {
      console.log("👤 로그인되지 않은 사용자 -> /onboarding 으로 리다이렉트");
      console.groupEnd();
      hasRedirected.current = true;
      window.location.href = "/onboarding";
      return;
    }

    // publicMetadata에서 role 확인
    const role = user.publicMetadata?.role as string | undefined;
    console.log("👤 사용자 역할:", role);

    // 역할이 설정되지 않았으면 onboarding으로 리다이렉트
    if (!role || (role !== "BUYER" && role !== "SELLER")) {
      console.log("🚀 역할 미설정 -> /onboarding 으로 리다이렉트");
      console.groupEnd();
      hasRedirected.current = true;
      // 하드 리프레시로 이동 (서버 측에서 세션 확인)
      window.location.href = "/onboarding";
    } else {
      console.log("✅ 역할 설정됨:", role);
      console.groupEnd();
    }
  }, [isLoaded, user, pathname]);

  return <>{children}</>;
}

