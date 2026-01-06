"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateProductStatus } from "@/app/seller/actions";

type MarkAsSoldButtonProps = {
  productId: string;
  disabled?: boolean;
};

/**
 * 판매 완료 처리 버튼
 *
 * Server Action을 호출하여 상품 상태를 SOLD로 변경합니다.
 */
export function MarkAsSoldButton({
  productId,
  disabled,
}: MarkAsSoldButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (disabled || isPending) return;

    startTransition(async () => {
      await updateProductStatus(productId, "SOLD");
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled || isPending}
      onClick={handleClick}
      className="h-8 px-3 text-xs"
    >
      {disabled ? "판매 완료됨" : isPending ? "처리 중..." : "판매 완료"}
    </Button>
  );
}

