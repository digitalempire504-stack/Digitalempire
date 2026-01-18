
export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  EARNING = 'EARNING',
  ADJUSTMENT = 'ADJUSTMENT',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  REFERRAL_COMMISSION = 'REFERRAL_COMMISSION',
  PACKAGE_PURCHASE = 'PACKAGE_PURCHASE'
}

export interface Package {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  dailyTasks: number;
  earningsPerTask: number;
  features: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  referCode?: string;
  referredBy?: string;
  referEarnings: number;
  totalReferrals: number;
  balance: number;
  activePackageId?: string;
  joinedAt: string;
  isBanned?: boolean;
  totalWithdrawn: number;
  totalRejected: number;
  tasksCompletedToday: number;
  lastTaskDate?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  method: string;
  accountNumber: string;
  createdAt: string;
  adminNote?: string;
  packageId?: string;
}

export interface UserComment {
  id: string;
  userId: string;
  username: string;
  text: string;
  rating: number;
  createdAt: string;
  isApproved: boolean;
}

export interface SiteConfig {
  heroHeadline: string;
  heroTagline: string;
  ctaText: string;
  supportEmail: string;
  whatsappNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  announcement: string;
  features: { icon: string; title: string; desc: string }[];
  isMaintenanceMode?: boolean;
}

export interface AppState {
  users: User[];
  packages: Package[];
  transactions: Transaction[];
  comments: UserComment[];
  siteConfig: SiteConfig;
  currentUser: User | null;
}
