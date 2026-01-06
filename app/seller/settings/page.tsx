/**
 * 사장님 설정 페이지 (임시)
 *
 * 사장님 계정 및 가게 설정을 관리하는 페이지입니다.
 * 향후 구현될 예정입니다.
 *
 * 예정된 기능:
 * - 가게 정보 수정
 * - 계정 설정
 * - 알림 설정 등
 */
export default function SellerSettingsPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          가게 정보 및 계정 설정을 관리할 수 있습니다.
        </p>
      </div>

      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p>설정 기능은 향후 구현될 예정입니다.</p>
      </div>
    </div>
  );
}

