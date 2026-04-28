/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'employee' | 'hr' | 'kitchen';
export type UserPermission = 'pair_card' | 'upload_image' | 'manage_credits' | 'edit_menu' | 'manage_users';

export interface UserProfile {
  id: string;
  cardId?: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRole[];
  permissions?: UserPermission[];
  credits: number;
  avatarUrl?: string;
}

export interface CreditRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface MenuItem {
  category: string;
  name: string;
  imageUrl?: string;
  calories?: number;
  price?: number;
  isFixMenu?: boolean;
}

export interface MealTransaction {
  id: string;
  userId: string;
  userName: string;
  date: string;
  items: string[];
  totalPrice: number;
  timestamp: any;
}

export interface Menu {
  id: string;
  date: string; // YYYY-MM-DD
  items: MenuItem[];
  updatedAt?: any;
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  cardId?: string;
  date: string; // YYYY-MM-DD
  timestamp: any;
}

export interface MailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
}
