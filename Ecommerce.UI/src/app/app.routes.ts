import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { AboutComponent } from './features/about/about.component';
import { ContactComponent } from './features/contact/contact.component';
import { AdminProductsComponent } from './features/admin/admin-products.component';
import { LoginComponent } from './features/auth/login.component';
import { CheckoutComponent } from './features/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'admin/products', component: AdminProductsComponent },
  { path: '**', redirectTo: '' }
];

