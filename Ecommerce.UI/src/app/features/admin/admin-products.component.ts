import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  // Form and data
  productForm!: FormGroup;
  products: Product[] = [];
  categories: string[] = [];
  
  // State management
  isEditMode = false;
  editingProductId: number | null = null;
  showForm = false;
  searchTerm = '';
  filterCategory = 'all';
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  displayedProducts: Product[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if user is admin
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (!userData.isAdmin) {
          alert('Access Denied: Admin only');
          window.location.href = '/products';
          return;
        }
      } catch (error) {
        window.location.href = '/login';
        return;
      }
    } else {
      window.location.href = '/login';
      return;
    }
    
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create form for product
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      currentPrice: ['', [Validators.required, Validators.min(0)]],
      originalPrice: ['', [Validators.required, Validators.min(0)]],
      discount: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      reviews: ['', [Validators.required, Validators.min(0)]],
      image: ['', Validators.required],
      badge: [''],
      features: ['']
    });
  }

  /**
   * Load products from service
   */
  private loadProducts(): void {
    this.productService.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products = products;
        this.updateCategories();
        this.updateDisplayedProducts();
      });
  }

  /**
   * Load categories from products
   */
  private updateCategories(): void {
    this.categories = this.productService.getCategories();
  }

  /**
   * Filter and paginate products
   */
  private updateDisplayedProducts(): void {
    let filtered = this.products;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.filterCategory);
    }

    // Paginate
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedProducts = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Show form for adding new product
   */
  showAddForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm.reset();
    this.clearMessages();
  }

  /**
   * Edit product
   */
  editProduct(product: Product): void {
    this.showForm = true;
    this.isEditMode = true;
    this.editingProductId = product.id;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      category: product.category,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      discount: product.discount,
      rating: product.rating,
      reviews: product.reviews,
      image: product.image,
      badge: product.badge || '',
      features: product.features.join(', ')
    });
    this.clearMessages();
  }

  /**
   * Save product (create or update)
   */
  saveProduct(): void {
    if (!this.productForm.valid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    const formValue = this.productForm.value;
    const features = formValue.features
      .split(',')
      .map((f: string) => f.trim())
      .filter((f: string) => f.length > 0);

    const productData = {
      ...formValue,
      features: features,
      currentPrice: +formValue.currentPrice,
      originalPrice: +formValue.originalPrice,
      discount: +formValue.discount,
      rating: +formValue.rating,
      reviews: +formValue.reviews
    };

    if (this.isEditMode && this.editingProductId) {
      // Update
      this.productService.updateProductLocal({ id: this.editingProductId, ...productData });
      this.successMessage = 'Product updated successfully!';
    } else {
      // Create
      const newId = this.productService.getNextId();
      this.productService.addProductLocal({ id: newId, ...productData });
      this.successMessage = 'Product created successfully!';
    }

    this.isLoading = false;
    this.resetForm();
    // Force update of displayed products
    this.updateDisplayedProducts();
    setTimeout(() => this.clearMessages(), 3000);
  }

  /**
   * Delete product
   */
  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProductLocal(product.id);
      this.successMessage = 'Product deleted successfully!';
      this.updateDisplayedProducts();
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  /**
   * Reset form
   */
  private resetForm(): void {
    this.productForm.reset();
    this.showForm = false;
    this.isEditMode = false;
    this.editingProductId = null;
  }

  /**
   * Cancel form
   */
  cancelForm(): void {
    this.resetForm();
  }

  /**
   * Search products
   */
  onSearch(): void {
    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

  /**
   * Filter by category
   */
  onFilterChange(): void {
    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const totalPages = Math.ceil(this.getFilteredCount() / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updateDisplayedProducts();
    }
  }

  /**
   * Go to previous page
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedProducts();
    }
  }

  /**
   * Get filtered product count
   */
  getFilteredCount(): number {
    let filtered = this.products;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.filterCategory);
    }

    return filtered.length;
  }

  /**
   * Get total pages
   */
  getTotalPages(): number {
    return Math.ceil(this.getFilteredCount() / this.itemsPerPage);
  }

  /**
   * Clear messages
   */
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} is too short`;
    }
    if (field?.hasError('min')) {
      return `${fieldName} must be a positive number`;
    }
    if (field?.hasError('max')) {
      return `${fieldName} exceeds maximum value`;
    }
    return null;
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Remove image from form
   */
  removeImage(): void {
    this.productForm.patchValue({
      image: ''
    });
  }

  /**
   * Handle image error (broken image)
   */
  onImageError(): void {
    console.warn('Image failed to load');
  }
}
