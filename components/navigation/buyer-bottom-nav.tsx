"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 학생(BUYER)용 하단 네비게이션 바
 *
 * Mobile-First 디자인으로 하단에 고정된 네비게이션 바입니다.
 * 사용자 전용 기능으로 이동할 수 있는 메뉴를 제공합니다.
 *
 * 메뉴 항목:
 * - 홈: /buyer
 * - 내 예약: /buyer/reservations
 * - 마이페이지: /buyer/me
 */
export function BuyerBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/buyer",
      label: "홈",
      icon: Home,
      isActive: (path: string) =>
        path === "/buyer" || path === "/buyer/",
    },
    {
      href: "/buyer/reservations",
      label: "내 예약",
      icon: CalendarCheck,
      isActive: (path: string) =>
        path === "/buyer/reservations" || path.startsWith("/buyer/reservations/"),
    },
    {
      href: "/buyer/me",
      label: "마이페이지",
      icon: UserRound,
      isActive: (path: string) =>
        path === "/buyer/me" || path.startsWith("/buyer/me/"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="max-w-[430px] mx-auto">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active && "text-primary")}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

