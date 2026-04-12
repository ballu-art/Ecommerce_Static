import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  categories = ['all', 'Tile Adhesives', 'Waterproofing Solutions', 'White Cement', 'Construction Chemicals', 'Surface Repair Solutions', 'Bonding Agents & Additives', 'Grouts & Fillers', 'Stone & Marble Solutions'];
  selectedCategory = 'all';
  sortBy = 'featured';
  searchTerm = '';
  selectedProductForQuote: Product | null = null;
  showWhatsappModal = false;
  isAdmin = false;
  
  // All products loaded from service
  allProducts: Product[] = [];
  displayedProducts: Product[] = [];
  itemsPerPage = 20;
  isLoadingMore = false;
  cartSuccessMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.checkAdminStatus();
  }

  ngOnInit() {
    this.loadProductsFromService();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductsFromService() {
    // Subscribe to product updates from service (includes admin changes)
    this.productService.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.allProducts = products;
        this.displayedProducts = [];
        this.loadMoreProducts();
      });
  }

  getFilteredProducts(): Product[] {
    let filtered = this.displayedProducts;
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (this.sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (this.sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (this.sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }
    
    return filtered;
  }

  loadMoreProducts() {
    const filteredCount = this.getFilteredCount();
    if (this.isLoadingMore || this.displayedProducts.length >= filteredCount) return;
    this.isLoadingMore = true;
    
    // Simulate network delay
    setTimeout(() => {
      // Get all products filtered by category
      let categoryFiltered = this.allProducts;
      if (this.selectedCategory !== 'all') {
        categoryFiltered = categoryFiltered.filter(p => p.category === this.selectedCategory);
      }
      
      const startIdx = this.displayedProducts.length;
      const endIdx = Math.min(startIdx + this.itemsPerPage, categoryFiltered.length);
      
      for (let i = startIdx; i < endIdx; i++) {
        this.displayedProducts.push(categoryFiltered[i]);
      }
      
      this.isLoadingMore = false;
    }, 300);
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    // Reset pagination for new category
    this.displayedProducts = [];
    this.loadMoreProducts();
  }

  getFilteredCount(): number {
    let filtered = this.allProducts;
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    return filtered.length;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Check if user scrolled near bottom
    const scrollPosition = (window.innerHeight + window.scrollY);
    const pageHeight = document.documentElement.scrollHeight;
    
    const filteredCount = this.getFilteredCount();
    if (scrollPosition >= pageHeight - 500 && !this.isLoadingMore && this.displayedProducts.length < filteredCount) {
      this.loadMoreProducts();
    }
  }

  openWhatsApp(product: Product) {
    const message = `Hi, I'm interested in ${product.name}. Can you provide me with a quotation and more details?`;
    const phoneNumber = '918401777499'; // +91 84017 77499
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  openWhatsAppModal(product: Product) {
    this.selectedProductForQuote = product;
    this.showWhatsappModal = true;
  }

  closeWhatsappModal() {
    this.showWhatsappModal = false;
    this.selectedProductForQuote = null;
  }

  confirmWhatsApp() {
    if (this.selectedProductForQuote) {
      this.openWhatsApp(this.selectedProductForQuote);
      this.closeWhatsappModal();
    }
  }

  toggleLike(product: Product, event: Event) {
    event.stopPropagation();
    product.liked = !product.liked;
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product as any, 1);
    this.cartSuccessMessage = `${product.name} added to cart!`;
    setTimeout(() => {
      this.cartSuccessMessage = '';
    }, 2000);
  }

  /**
   * Check if current user is admin
   */
  private checkAdminStatus(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.isAdmin = userData.isAdmin || false;
      } catch (error) {
        this.isAdmin = false;
      }
    }
  }
}

