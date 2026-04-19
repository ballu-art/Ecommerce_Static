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

  private readonly PRODUCTS_JSON_URL = '/files/products.json';
  private readonly STORAGE_KEY = 'products_data';

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  /**
   * Load products from JSON file or localStorage
   */
  loadProducts(): void {
    // Check localStorage first for any saved changes
    const savedProducts = this.getFromLocalStorage();
    if (savedProducts && savedProducts.length > 0) {
      this.productsSubject.next(savedProducts);
      console.log(`Loaded ${savedProducts.length} products from localStorage`);
      return;
    }

    // Load from JSON file
    this.http.get<Product[]>(this.PRODUCTS_JSON_URL).subscribe({
      next: (products) => {
        this.productsSubject.next(products);
        this.saveToLocalStorage(products);
        console.log(`Loaded ${products.length} products from products.json`);
      },
      error: (error) => {
        console.error('Error loading products.json:', error);
        this.productsSubject.next([]);
      }
    });
  }

  /**
   * Save products to localStorage (persists CRUD operations)
   */
  private saveToLocalStorage(products: Product[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
      console.log('Products saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get products from localStorage
   */
  private getFromLocalStorage(): Product[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
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
   * CREATE: Add new product to products.json
   */
  addProductLocal(product: Omit<Product, 'id'>): void {
    const newId = this.getNextId();
    const newProduct: Product = {
      ...(product as Product),
      id: newId,
      liked: false
    };

    const products = [...this.productsSubject.value, newProduct];
    this.productsSubject.next(products);
    this.saveToLocalStorage(products);
    console.log(`Product added: ${newProduct.name}`);
  }

  /**
   * UPDATE: Update existing product in products.json
   */
  updateProductLocal(product: Product): void {
    const products = this.productsSubject.value.map(p =>
      p.id === product.id ? product : p
    );
    this.productsSubject.next(products);
    this.saveToLocalStorage(products);
    console.log(`Product updated: ${product.name}`);
  }

  /**
   * DELETE: Remove product from products.json
   */
  deleteProductLocal(id: number): void {
    const products = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(products);
    this.saveToLocalStorage(products);
    console.log(`Product deleted (ID: ${id})`);
  }

  /**
   * DELETE MULTIPLE: Remove multiple products from products.json
   */
  deleteMultipleProducts(ids: number[]): number {
    const before = this.productsSubject.value.length;
    const products = this.productsSubject.value.filter(p => !ids.includes(p.id));
    const deleted = before - products.length;

    if (deleted > 0) {
      this.productsSubject.next(products);
      this.saveToLocalStorage(products);
      console.log(`${deleted} products deleted`);
    }

    return deleted;
  }

  /**
   * UPDATE MULTIPLE: Bulk update products in products.json
   */
  updateMultipleProducts(updates: { id: number; changes: Partial<Product> }[]): number {
    let products = [...this.productsSubject.value];
    let updatedCount = 0;

    updates.forEach(({ id, changes }) => {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...changes, id };
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      this.productsSubject.next(products);
      this.saveToLocalStorage(products);
      console.log(`${updatedCount} products updated`);
    }

    return updatedCount;
  }

  /**
   * BULK OPERATION: Update all prices with multiplier in products.json
   */
  updatePrices(multiplier: number): void {
    const products = this.productsSubject.value.map(p => ({
      ...p,
      currentPrice: Math.round(p.currentPrice * multiplier * 100) / 100,
      originalPrice: Math.round(p.originalPrice * multiplier * 100) / 100
    }));

    this.productsSubject.next(products);
    this.saveToLocalStorage(products);
    console.log(`All prices updated (${multiplier}x)`);
  }

  /**
   * BULK OPERATION: Apply discount to category in products.json
   */
  applyDiscountToCategory(category: string, discountPercent: number): number {
    const products = this.productsSubject.value.map(p => {
      if (p.category === category) {
        return {
          ...p,
          currentPrice: Math.round(p.currentPrice * (1 - discountPercent / 100) * 100) / 100,
          discount: discountPercent
        };
      }
      return p;
    });

    const updatedCount = products.filter(p => p.category === category).length;
    if (updatedCount > 0) {
      this.productsSubject.next(products);
      this.saveToLocalStorage(products);
      console.log(`${discountPercent}% discount applied to ${category}`);
    }

    return updatedCount;
  }

  /**
   * CLEAR: Remove all products from products.json
   */
  clearAllProducts(): void {
    this.productsSubject.next([]);
    this.saveToLocalStorage([]);
    console.log('All products cleared');
  }

  /**
   * RESET: Reset products to original products.json
   */
  resetToOriginal(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.loadProducts();
    console.log('Products reset to original');
  }

  /**
   * EXPORT: Get products as JSON string
   */
  exportAsJson(): string {
    return JSON.stringify(this.productsSubject.value, null, 2);
  }

  /**
   * EXPORT: Download products to file
   */
  exportToFile(): void {
    const data = this.exportAsJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('Products exported to file');
  }

  /**
   * IMPORT: Import products from JSON
   */
  importFromJson(jsonData: string): { success: boolean; message: string; count?: number } {
    try {
      const imported = JSON.parse(jsonData) as Product[];

      if (!Array.isArray(imported)) {
        return { success: false, message: 'Invalid JSON format. Expected an array.' };
      }

      const isValid = imported.every(p =>
        p.id && p.name && p.description && p.currentPrice !== undefined &&
        p.originalPrice !== undefined && p.discount !== undefined
      );

      if (!isValid) {
        return { success: false, message: 'Some products are missing required fields.' };
      }

      this.productsSubject.next(imported);
      this.saveToLocalStorage(imported);
      console.log(`${imported.length} products imported`);

      return { success: true, message: 'Products imported successfully', count: imported.length };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
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

  /**
   * SEARCH: Search products locally
   */
  searchProductsLocal(searchTerm: string): Product[] {
    const term = searchTerm.toLowerCase();
    return this.productsSubject.value.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  /**
   * Get current products (synchronous)
   */
  getProductsSync(): Product[] {
    return this.productsSubject.value;
  }

  /**
   * UTILITY: Get products by category
   */
  getByCategory(category: string): Product[] {
    return this.productsSubject.value.filter(p => p.category === category);
  }

  /**
   * UTILITY: Get product count
   */
  getCount(): number {
    return this.productsSubject.value.length;
  }

  /**
   * UTILITY: Get best selling products
   */
  getBestSelling(limit: number = 10): Product[] {
    return [...this.productsSubject.value]
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, limit);
  }

  /**
   * UTILITY: Get featured products (with badge)
   */
  getFeatured(): Product[] {
    return this.productsSubject.value.filter(p => p.badge && p.badge.length > 0);
  }

  /**
   * UTILITY: Check if product exists
   */
  productExists(id: number): boolean {
    return this.productsSubject.value.some(p => p.id === id);
  }

  /**
   * UTILITY: Get products by price range
   */
  getByPriceRange(minPrice: number, maxPrice: number): Product[] {
    return this.productsSubject.value.filter(p =>
      p.currentPrice >= minPrice && p.currentPrice <= maxPrice
    );
  }

  /**
   * UTILITY: Get products by minimum rating
   */
  getByMinRating(minRating: number): Product[] {
    return this.productsSubject.value.filter(p => p.rating >= minRating);
  }
}
