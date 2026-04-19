import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { APP_CONSTANTS } from '../../config/constants';

interface CartItem {
  id: number;
  name: string;
  currentPrice: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  shippingCost = 0;
  taxPercentage = 18; // GST
  tax = 0;
  finalTotal = 0;

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  city = '';
  state = '';
  zipCode = '';
  paymentMethod = 'cod'; // Default to COD

  isProcessing = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCartItems(): void {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.calculateTotals();
      });
  }

  calculateTotals(): void {
    this.cartTotal = this.cartItems.reduce((total, item) => {
      return total + (item.currentPrice * item.quantity);
    }, 0);

    // Calculate shipping (free for orders above 500)
    this.shippingCost = this.cartTotal > 500 ? 0 : 50;

    // Calculate tax
    this.tax = (this.cartTotal * this.taxPercentage) / 100;

    // Calculate final total
    this.finalTotal = this.cartTotal + this.shippingCost + this.tax;
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(itemId, quantity);
    }
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.firstName.trim()) {
      this.errorMessage = 'First name is required';
      return false;
    }

    if (!this.lastName.trim()) {
      this.errorMessage = 'Last name is required';
      return false;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email';
      return false;
    }

    if (!this.phone.trim()) {
      this.errorMessage = 'Phone number is required';
      return false;
    }

    if (this.phone.length < 10) {
      this.errorMessage = 'Please enter a valid phone number';
      return false;
    }

    if (!this.address.trim()) {
      this.errorMessage = 'Address is required';
      return false;
    }

    if (!this.city.trim()) {
      this.errorMessage = 'City is required';
      return false;
    }

    if (!this.state.trim()) {
      this.errorMessage = 'State is required';
      return false;
    }

    if (!this.zipCode.trim()) {
      this.errorMessage = 'Zip code is required';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  placeOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create order
    const order = {
      id: Math.random().toString(36).substring(7),
      items: this.cartItems,
      total: this.finalTotal,
      shipping: this.shippingCost,
      tax: this.tax,
      paymentMethod: this.paymentMethod,
      shippingAddress: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        address: this.address,
        city: this.city,
        state: this.state,
        zipCode: this.zipCode
      },
      orderDate: new Date(),
      status: 'confirmed'
    };

    // Store order in localStorage
    localStorage.setItem('lastOrder', JSON.stringify(order));

    // Clear the cart
    this.cartService.clearCart();

    this.isProcessing = false;
    this.successMessage = 'Order placed successfully! Opening WhatsApp to confirm...';

    // Generate order summary
    const orderSummary = this.generateOrderSummary(order);
    
    // Send to WhatsApp
    setTimeout(() => {
      this.sendOrderViaWhatsApp(orderSummary);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }, 500);
  }

  /**
   * Generate order summary for WhatsApp
   */
  private generateOrderSummary(order: any): string {
    let summary = `📦 *NEW ORDER #${order.id}*\n\n`;
    summary += `👤 *Customer Details*\n`;
    summary += `Name: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}\n`;
    summary += `Email: ${order.shippingAddress.email}\n`;
    summary += `Phone: ${order.shippingAddress.phone}\n`;
    summary += `Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}\n\n`;
    
    summary += `📋 *Order Items*\n`;
    order.items.forEach((item: any) => {
      summary += `• ${item.name} x${item.quantity} = ₹${(item.currentPrice * item.quantity).toFixed(2)}\n`;
    });
    
    summary += `\n💰 *Order Summary*\n`;
    summary += `Subtotal: ₹${order.total.toFixed(2)}\n`;
    summary += `Shipping: ${order.shipping === 0 ? 'FREE' : '₹' + order.shipping.toFixed(2)}\n`;
    summary += `Tax (18%): ₹${order.tax.toFixed(2)}\n`;
    summary += `*Total: ₹${(order.total + order.shipping + order.tax).toFixed(2)}*\n\n`;
    summary += `🕐 Order Date: ${new Date(order.orderDate).toLocaleString()}\n`;
    summary += `\nPlease confirm the order and provide delivery timeline.`;
    
    return summary;
  }

  /**
   * Send order via WhatsApp
   */
  private sendOrderViaWhatsApp(message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${APP_CONSTANTS.WHATSAPP_PHONE_NUMBER}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  goBack(): void {
    window.history.back();
  }
}
