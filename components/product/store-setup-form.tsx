"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createStore } from "@/app/seller/actions";

/**
 * 가게 정보 등록 폼 스키마
 */
const storeFormSchema = z.object({
  name: z.string().min(1, "가게 이름을 입력해주세요.").max(100, "가게 이름은 100자 이하여야 합니다."),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeFormSchema>;

/**
 * 가게 정보 등록 폼 컴포넌트
 *
 * 사장님이 최초 1회 가게 정보를 등록하는 폼입니다.
 */
export function StoreSetupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  });

  const onSubmit = async (data: StoreFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await createStore(data.name, data.address, data.phone);

      if (!result.success) {
        setError(result.error || "가게 정보 등록에 실패했습니다.");
        return;
      }

      // 성공 시 페이지 새로고침 (서버 컴포넌트가 다시 렌더링되어 가게 정보 확인)
      router.refresh();
    } catch (err) {
      console.error("Error submitting store form:", err);
      setError("시스템 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">가게 정보 등록</h2>
        <p className="text-sm text-muted-foreground">
          상품을 등록하기 전에 가게 정보를 먼저 등록해주세요.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가게 이름 *</FormLabel>
                <FormControl>
                  <Input placeholder="예: 맛있는 떡볶이집" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가게 주소</FormLabel>
                <FormControl>
                  <Input placeholder="예: 안산시 단원구..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가게 전화번호</FormLabel>
                <FormControl>
                  <Input placeholder="예: 031-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "가게 정보 등록"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

