import { Injectable } from '@angular/core';

/**
 * Authentication Service
 * Centralized user authentication logic
 * Eliminates code duplication across components
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_STORAGE_KEY = 'user';
  private readonly DEFAULT_PHONE = '919876543210';

  constructor() { }

  /**
   * Get current logged-in user
   */
  getUser(): { id: string; isAdmin: boolean; phone?: string } | null {
    try {
      const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin ?? false;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  /**
   * Login user
   */
  login(userId: string, isAdmin: boolean = false, phone?: string): void {
    const userData = {
      id: userId,
      isAdmin: isAdmin,
      phone: phone || this.DEFAULT_PHONE
    };
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userData));
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  /**
   * Get user phone number
   */
  getUserPhone(): string {
    const user = this.getUser();
    return user?.phone || this.DEFAULT_PHONE;
  }

  /**
   * Update user data
   */
  updateUser(userData: Partial<{ id: string; isAdmin: boolean; phone: string }>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }

  /**
   * Clear user data
   */
  clear(): void {
    this.logout();
  }
}
