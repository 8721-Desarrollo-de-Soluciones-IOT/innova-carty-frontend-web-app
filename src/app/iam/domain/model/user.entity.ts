/** ADMIN uses the console; SHOPPER accounts only use the mobile app. */
export type UserRole = 'ADMIN' | 'SHOPPER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole | string;
  /** Shown under the name, e.g. "Floor supervisor". */
  jobTitle?: string;
  storeId: number;
  token: string;
}

/** The console is only for store staff. */
export function canUseConsole(user: User): boolean {
  return user.role !== 'SHOPPER';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
