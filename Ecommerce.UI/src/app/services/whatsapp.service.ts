import { Injectable } from '@angular/core';
import { Product } from './product.service';

/**
 * WhatsApp Integration Service
 * Centralized service for all WhatsApp functionality
 * Eliminates code duplication across components
 */
@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private readonly PHONE_NUMBER = '919876543210'; // Replace with actual business number
  private readonly WHATSAPP_API = 'https://wa.me/';

  constructor() { }

  /**
   * Open WhatsApp with product inquiry message
   */
  openProductInquiry(product: Product, quantity: number = 1): void {
    const message = this.formatProductMessage(product, quantity);
    this.sendMessage(message);
  }

  /**
   * Open WhatsApp with custom message
   */
  openCustomMessage(message: string): void {
    this.sendMessage(message);
  }

  /**
   * Open WhatsApp with checkout order summary
   */
  openOrderSummary(orderItems: Array<{ name: string; price: number; quantity: number }>, total: number): void {
    const message = this.formatOrderMessage(orderItems, total);
    this.sendMessage(message);
  }

  /**
   * Open WhatsApp with general inquiry
   */
  openGeneralInquiry(subject: string, message: string): void {
    const fullMessage = `${subject}%0A${message}`;
    this.sendMessage(fullMessage);
  }

  /**
   * Format product inquiry message
   */
  private formatProductMessage(product: Product, quantity: number): string {
    const encodedMessage = 
      `Product Inquiry%0A` +
      `Product: ${product.name}%0A` +
      `Price: ₹${product.currentPrice}%0A` +
      `Quantity: ${quantity}%0A` +
      `Total: ₹${product.currentPrice * quantity}%0A` +
      `%0APlease provide more information about this product.`;
    
    return encodedMessage;
  }

  /**
   * Format order summary message
   */
  private formatOrderMessage(orderItems: Array<{ name: string; price: number; quantity: number }>, total: number): string {
    let itemsText = 'Order Summary:%0A';
    itemsText += '─────────────────%0A';
    
    orderItems.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      itemsText += `${index + 1}. ${item.name}%0A`;
      itemsText += `   Qty: ${item.quantity} × ₹${item.price} = ₹${lineTotal}%0A`;
    });
    
    itemsText += '─────────────────%0A';
    itemsText += `Total: ₹${total}%0A`;
    itemsText += `%0APlease confirm this order.`;
    
    return itemsText;
  }

  /**
   * Send message via WhatsApp
   */
  private sendMessage(message: string): void {
    if (!this.PHONE_NUMBER) {
      console.error('WhatsApp phone number not configured');
      return;
    }

    try {
      const whatsappUrl = `${this.WHATSAPP_API}${this.PHONE_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank', 'width=600,height=700');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  }

  /**
   * Check if WhatsApp is available on this device
   */
  isWhatsAppAvailable(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Get WhatsApp web URL (for desktop)
   */
  getWhatsAppWebUrl(): string {
    return `${this.WHATSAPP_API}${this.PHONE_NUMBER}`;
  }
}
