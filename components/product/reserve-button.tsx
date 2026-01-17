"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reserveProduct } from "@/app/buyer/actions";
import { ReservationSuccessDialog } from "./reservation-success-dialog";
import { Loader2 } from "lucide-react";

/**
 * 예약 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 사용하는 예약 버튼입니다.
 * 클릭 시 예약 Server Action을 호출하고, 성공 시 팝업을 표시합니다.
 */
export function ReserveButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReserve = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await reserveProduct(productId);

      if (result.success) {
        setOrderId(result.order_id);
        setIsSuccessDialogOpen(true);
      } else {
        setErrorMessage(result.message || "예약에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error reserving product:", error);
      setErrorMessage("시스템 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={handleReserve}
          disabled={disabled || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              예약 중...
            </>
          ) : (
            "예약하기"
          )}
        </Button>
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </div>

      <ReservationSuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        orderId={orderId}
      />
    </>
  );
}
