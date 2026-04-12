import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  description: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  category: string;
  features: string[];
  price?: string;
  priceRange?: string;
  liked?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  private readonly API_URL = 'http://localhost:5000/api/products';
  private readonly PRODUCTS_JSON_URL = '/images/products.json';
  private readonly STORAGE_KEY = 'bondmaster_products';

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  /**
   * Load all products from localStorage or JSON file
   */
  loadProducts(): void {
    // First check localStorage for existing products
    const cachedProducts = this.getProductsFromStorage();
    if (cachedProducts && cachedProducts.length > 0) {
      this.productsSubject.next(cachedProducts);
      return;
    }

    // If no cached products, load from JSON file
    this.http.get<Product[]>(this.PRODUCTS_JSON_URL).subscribe({
      next: (products) => {
        this.productsSubject.next(products);
        this.saveProductsToStorage(products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.productsSubject.next([]);
      }
    });
  }

  /**
   * Get products from localStorage
   */
  private getProductsFromStorage(): Product[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Save products to localStorage
   */
  private saveProductsToStorage(products: Product[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get all products
   */
  getAll(): Observable<Product[]> {
    return this.products$;
  }

  /**
   * Get product by ID
   */
  getById(id: number): Observable<Product | undefined> {
    return new Observable(observer => {
      const product = this.productsSubject.value.find(p => p.id === id);
      observer.next(product);
      observer.complete();
    });
  }

  /**
   * Create new product - sends to backend API
   */
  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/create`, product).pipe(
      tap((newProduct) => {
        const updated = [...this.productsSubject.value, newProduct];
        this.productsSubject.next(updated);
      })
    );
  }

  /**
   * Update existing product - sends to backend API
   */
  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product).pipe(
      tap((updatedProduct) => {
        const products = this.productsSubject.value.map(p =>
          p.id === id ? updatedProduct : p
        );
        this.productsSubject.next(products);
      })
    );
  }

  /**
   * Delete product - sends to backend API
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        const products = this.productsSubject.value.filter(p => p.id !== id);
        this.productsSubject.next(products);
      })
    );
  }

  /**
   * Get current products (synchronous)
   */
  getProductsSync(): Product[] {
    return this.productsSubject.value;
  }

  /**
   * Add product to local state (optimistic update)
   */
  addProductLocal(product: Product): void {
    const updated = [...this.productsSubject.value, product];
    this.productsSubject.next(updated);
    this.saveProductsToStorage(updated);
    // Also persist to JSON file if possible
    this.persistProductsToJson(updated);
  }

  /**
   * Update product in local state (optimistic update)
   */
  updateProductLocal(product: Product): void {
    const products = this.productsSubject.value.map(p =>
      p.id === product.id ? product : p
    );
    this.productsSubject.next(products);
    this.saveProductsToStorage(products);
    // Also persist to JSON file if possible
    this.persistProductsToJson(products);
  }

  /**
   * Delete product from local state (optimistic update)
   */
  deleteProductLocal(id: number): void {
    const products = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(products);
    this.saveProductsToStorage(products);
    // Also persist to JSON file if possible
    this.persistProductsToJson(products);
  }

  /**
   * Persist products to JSON file via API endpoint
   */
  private persistProductsToJson(products: Product[]): void {
    // Try to send to backend API if available
    this.http.post(`${this.API_URL}/save-all`, products).subscribe({
      next: () => {
        console.log('Products persisted to JSON file');
      },
      error: (error) => {
        // If backend is not available, products are still saved in localStorage
        console.warn('Could not persist to JSON file, but saved in localStorage:', error);
      }
    });
  }

  /**
   * Get next available ID
   */
  getNextId(): number {
    const products = this.productsSubject.value;
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  }

  /**
   * Get unique categories
   */
  getCategories(): string[] {
    const products = this.productsSubject.value;
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  }
}
