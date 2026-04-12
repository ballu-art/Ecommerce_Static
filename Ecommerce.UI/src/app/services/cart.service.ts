import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product.service';

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  private cartCount = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCount.asObservable();

  private totalPrice = new BehaviorSubject<number>(0);
  public totalPrice$ = this.totalPrice.asObservable();

  constructor() {
    this.loadCart();
  }

  /**
   * Load cart from localStorage
   */
  private loadCart(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const items = JSON.parse(saved) as CartItem[];
        this.cartItems.next(items);
        this.updateCounts();
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }

  /**
   * Save cart to localStorage
   */
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    this.cartItems.next(this.cartItems.value);
    this.updateCounts();
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product, quantity: number = 1): void {
    const existing = this.cartItems.value.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.value.push({ ...product, quantity });
    }

    this.saveCart();
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: number): void {
    const items = this.cartItems.value.filter(item => item.id !== productId);
    this.cartItems.next(items);
    this.saveCart();
  }

  /**
   * Update product quantity
   */
  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.value.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.cartItems.next([...this.cartItems.value]);
        this.saveCart();
      }
    }
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.cartItems.next([]);
    this.saveCart();
  }

  /**
   * Get cart items
   */
  getCart(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  /**
   * Get all cart items (synchronous)
   */
  getCartSync(): CartItem[] {
    return this.cartItems.value;
  }

  /**
   * Update counts and totals
   */
  private updateCounts(): void {
    const items = this.cartItems.value;
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);

    this.cartCount.next(count);
    this.totalPrice.next(total);
  }

  /**
   * Get cart count
   */
  getCartCount(): Observable<number> {
    return this.cartCount$;
  }

  /**
   * Get total price
   */
  getTotalPrice(): Observable<number> {
    return this.totalPrice$;
  }

  /**
   * Check if product in cart
   */
  isInCart(productId: number): boolean {
    return this.cartItems.value.some(item => item.id === productId);
  }

  /**
   * Get item quantity
   */
  getItemQuantity(productId: number): number {
    const item = this.cartItems.value.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }
}
