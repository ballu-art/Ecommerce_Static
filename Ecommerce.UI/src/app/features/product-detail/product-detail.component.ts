import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  priceRange: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string | null;
  category: string;
  features: string[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  showMessageModal: boolean = false;
  messageText: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  quantity: number = 1;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.http.get<Product[]>('/files/products.json').subscribe({
      next: (data: Product[]) => {
        this.products = data;
        if (this.products.length > 0) {
          this.selectedProduct = this.products[0];
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openMessageModal(product: Product | null): void {
    if (!product) return;
    this.selectedProduct = product;
    this.showMessageModal = true;
    this.messageText = '';
    this.customerEmail = '';
    this.customerPhone = '';
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
    alert(`Added ${this.quantity} x ${this.selectedProduct?.name} to cart`);
  }

  getBadgeClass(badge: string | null | undefined): string {
    if (!badge) return '';
    return `badge-${badge.toLowerCase()}`;
  }

  hasBadge(badge: string | null | undefined): boolean {
    return !!badge;
  }
}
