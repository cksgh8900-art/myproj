"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { productFormSchema, type ProductFormData } from "./schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createProduct } from "./actions";

/**
 * 상품 등록 폼 컴포넌트
 *
 * 사장님이 상품을 등록하는 폼입니다.
 * - 이미지 업로드
 * - 메뉴명, 정가, 할인가, 픽업 시간 입력
 * - 바로 섭취 여부 선택
 */
export function ProductUploadForm({ storeId }: { storeId: string }) {
  // storeId는 향후 사용 예정 (현재는 getStore()로 가게 정보를 가져옴)
  void storeId;
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [minDateTime, setMinDateTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydration mismatch 방지를 위해 클라이언트 마운트 후 현재 시간 설정
  useEffect(() => {
    setMinDateTime(new Date().toISOString().slice(0, 16));
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      original_price: 0,
      discount_price: 0,
      is_instant: false,
      pickup_deadline: "",
      image: undefined as any,
    },
  });

  const imageFile = form.watch("image");

  // 이미지 미리보기
  useEffect(() => {
    if (imageFile && imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setPreview(null);
    }
  }, [imageFile]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await createProduct(data);

      if (!result.success) {
        setError("error" in result ? result.error : "상품 등록에 실패했습니다.");
        return;
      }

      // 성공 시 대시보드로 이동
      router.push("/seller/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("시스템 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 이미지 업로드 */}
          <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>상품 이미지</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="상품 미리보기"
                          className="w-full h-64 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPreview(null);
                            form.setValue("image", undefined as any);
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="size-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            이미지를 선택하거나 드래그하세요
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPEG, PNG, WebP (최대 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 메뉴명 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>메뉴명</FormLabel>
                <FormControl>
                  <Input placeholder="예: 떡볶이 세트" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 정가 */}
          <FormField
            control={form.control}
            name="original_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>정가 (원)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 15000"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10) || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 할인가 */}
          <FormField
            control={form.control}
            name="discount_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>할인가 (원)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 10000"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10) || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 바로 섭취 여부 */}
          <FormField
            control={form.control}
            name="is_instant"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    바로 섭취 가능
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    조리 없이 바로 먹을 수 있는 상품인 경우 체크하세요
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* 픽업 마감 시간 */}
          <FormField
            control={form.control}
            name="pickup_deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>픽업 마감 시간</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    min={minDateTime}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "상품 등록"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

