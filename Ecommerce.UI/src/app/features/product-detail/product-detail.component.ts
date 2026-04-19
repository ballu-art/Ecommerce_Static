import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.service';
import { APP_CONSTANTS } from '../../config/constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  showMessageModal: boolean = false;
  messageText: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  quantity: number = 1;
  breadcrumbs: { label: string; path: string }[] = [];
  cartAdded: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Subscribe to route params with proper cleanup
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = parseInt(params['id'], 10);
        this.loadProducts(productId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(productIdToSelect?: number): void {
    // Subscribe to products from ProductService (uses localStorage cache)
    this.productService.products$.subscribe({
      next: (data: Product[]) => {
        this.products = data;
        
        if (productIdToSelect) {
          // Find and select the specific product by ID from the URL
          const product = this.products.find(p => p.id === productIdToSelect);
          if (product) {
            this.selectedProduct = product;
            this.updateBreadcrumbs();
          } else {
            // Fallback to first product if ID not found
            console.warn(`Product with ID ${productIdToSelect} not found`);
            if (this.products.length > 0) {
              this.selectedProduct = this.products[0];
              this.updateBreadcrumbs();
            }
          }
        } else {
          // No route param, show first product
          if (this.products.length > 0) {
            this.selectedProduct = this.products[0];
            this.updateBreadcrumbs();
          }
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  updateBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Products', path: '/products' },
      { label: this.selectedProduct?.name || 'Product', path: '' }
    ];
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.updateBreadcrumbs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openMessageModal(product: Product | null): void {
    if (!product) return;
    this.selectedProduct = product;
    this.updateBreadcrumbs();
    this.showMessageModal = true;
    this.messageText = '';
    this.customerEmail = '';
    this.customerPhone = '';
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
  }

  sendMessage(): void {
    if (!this.selectedProduct || !this.customerEmail || !this.customerPhone) {
      alert('Please fill in all required fields');
      return;
    }
    // Here you would send the message to your backend
    console.log('Message sent:', {
      product: this.selectedProduct.name,
      message: this.messageText,
      email: this.customerEmail,
      phone: this.customerPhone
    });
    alert('Thank you! We will contact you shortly.');
    this.closeMessageModal();
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  calculateSavings(): number {
    if (!this.selectedProduct) return 0;
    return this.selectedProduct.originalPrice - this.selectedProduct.currentPrice;
  }

  addToCart(): void {
    if (!this.selectedProduct) return;
    this.cartService.addToCart(this.selectedProduct as any, this.quantity);
    this.cartAdded = true;
    this.quantity = 1;
    setTimeout(() => { this.cartAdded = false; }, 2000);
  }

  buyNow(): void {
    if (!this.selectedProduct) return;

    // Create professionally formatted message with classic design
    const whatsappMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         PRODUCT INQUIRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*${this.selectedProduct.name}*

*Category:* ${this.selectedProduct.category}
*Rating:* ${this.selectedProduct.rating || 'N/A'} ⭐

*Description:*
${this.selectedProduct.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello! I'm interested in this product.

Can you please provide me with:
• Detailed specifications
• Bulk pricing options
• Delivery timeframe
• Payment terms
• Technical support information

Thank you for your time!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage);

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${APP_CONSTANTS.WHATSAPP_PHONE_NUMBER}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  getBadgeClass(badge: string | null | undefined): string {
    if (!badge) return '';
    return `badge-${badge.toLowerCase().replace(/\s+/g, '-')}`;
  }

  hasBadge(badge: string | null | undefined): boolean {
    return !!badge;
  }
}
