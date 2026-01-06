import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * 사용자 역할 타입
 */
export type UserRole = "BUYER" | "SELLER";

/**
 * 현재 사용자의 역할을 가져옵니다.
 *
 * @returns 사용자의 역할 ('BUYER' | 'SELLER' | null)
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const role = user.publicMetadata?.role as UserRole | undefined;

    if (role === "BUYER" || role === "SELLER") {
      return role;
    }

    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * 현재 사용자가 SELLER 역할인지 확인합니다.
 *
 * @returns SELLER 역할이면 true, 아니면 false
 */
export async function isSeller(): Promise<boolean> {
  const role = await getUserRole();
  return role === "SELLER";
}

/**
 * 현재 사용자가 BUYER 역할인지 확인합니다.
 *
 * @returns BUYER 역할이면 true, 아니면 false
 */
export async function isBuyer(): Promise<boolean> {
  const role = await getUserRole();
  return role === "BUYER";
}

/**
 * 현재 사용자가 특정 역할을 가지고 있는지 확인합니다.
 *
 * @param targetRole - 확인할 역할
 * @returns 해당 역할이면 true, 아니면 false
 */
export async function hasRole(targetRole: UserRole): Promise<boolean> {
  const role = await getUserRole();
  return role === targetRole;
}

