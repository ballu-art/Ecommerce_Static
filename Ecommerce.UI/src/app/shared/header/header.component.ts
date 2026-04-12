import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  cartCount = 0;
  cartItems: any[] = [];
  cartTotal = 0;
  showCartModal = false;
  isUserLoggedIn = false;
  isAdmin = false;
  userName = '';

  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.checkUserLogin();
    
    // Listen for route changes to update login state
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkUserLogin();
      });
    
    this.cartService.cartCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartCount = count;
      });
    
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.calculateCartTotal();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateCartTotal(): void {
    this.cartTotal = this.cartItems.reduce((total, item) => {
      return total + (item.currentPrice * item.quantity);
    }, 0);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  checkout(): void {
    this.showCartModal = false;
    this.router.navigate(['/checkout']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  downloadBrochure(): void {
    const link = document.createElement('a');
    link.href = 'files/BONDMASTER2026.pdf';
    link.download = 'BONDMASTER2026.pdf';
    link.click();
  }

  toggleCart(): void {
    this.showCartModal = !this.showCartModal;
  }

  closeCart(): void {
    this.showCartModal = false;
  }

  checkUserLogin(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.isUserLoggedIn = true;
        this.isAdmin = userData.isAdmin || false;
        this.userName = userData.email.split('@')[0];
      } catch (error) {
        this.isUserLoggedIn = false;
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isUserLoggedIn = false;
    this.userName = '';
  }
}
