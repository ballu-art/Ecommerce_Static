import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  otp = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;  // Controls whether to show the password section
  isPasswordVisible = false;  // Controls password field visibility (eye icon)
  showOtpVerification = false;  // Controls OTP verification section

  constructor(private router: Router) {}

  /**
   * Show password form after email is entered
   */
  showPasswordForm(): void {
    this.errorMessage = '';

    // Validate email
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email or mobile number';
      return;
    }

    // Basic email validation
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Show password form
    this.showPassword = true;
  }

  /**
   * Go back to email entry
   */
  goBackToEmail(): void {
    this.showOtpVerification = false;
    this.showPassword = false;
    this.otp = '';
    this.errorMessage = '';
  }

  /**
   * Verify OTP code
   */
  verifyOtp(): void {
    this.errorMessage = '';

    if (!this.otp.trim()) {
      this.errorMessage = 'Please enter the OTP';
      return;
    }

    if (this.otp.length < 4) {
      this.errorMessage = 'OTP must be at least 4 characters';
      return;
    }

    this.isLoading = true;

    // Simulate OTP verification
    setTimeout(() => {
      // Store user session
      localStorage.setItem('user', JSON.stringify({
        email: this.email,
        loginTime: new Date(),
        method: 'otp'
      }));

      this.isLoading = false;
      // Redirect to products
      this.router.navigate(['/products']);
    }, 1000);
  }

  /**
   * Resend OTP code
   */
  resendOtp(): void {
    this.errorMessage = '';
    this.otp = '';
    this.isLoading = true;

    // Simulate resending OTP
    setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = 'OTP has been resent to your number';
      // Clear error message after 3 seconds
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }, 500);
  }

  /**
   * Send OTP to WhatsApp
   */
  sendOtpWhatsApp(): void {
    this.errorMessage = '';
    this.otp = '';
    this.isLoading = true;

    // Simulate sending OTP to WhatsApp
    setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = 'OTP sent to your WhatsApp';
      // Clear error message after 3 seconds
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }, 500);
  }

  /**
   * Sign in with password instead
   */
  signInWithPassword(): void {
    this.showOtpVerification = false;
    this.showPassword = true;
    this.otp = '';
    this.errorMessage = '';
  }

  /**
   * Handle login form submission (password method)
   */
  onSubmit(): void {
    this.errorMessage = '';

    // Validate password
    if (!this.password.trim()) {
      this.errorMessage = 'Password is required';
      return;
    }

    if (this.password.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters';
      return;
    }

    this.isLoading = true;

    // Check for admin credentials
    const isAdmin = this.email === 'admin@gmail.com' && this.password === 'admin';

    // Simulate login (in real app, call auth service)
    setTimeout(() => {
      // Store user session
      localStorage.setItem('user', JSON.stringify({
        email: this.email,
        loginTime: new Date(),
        method: 'password',
        isAdmin: isAdmin
      }));

      this.isLoading = false;
      // Redirect to admin if admin credentials, otherwise to products
      if (isAdmin) {
        this.router.navigate(['/admin/products']);
      } else {
        this.router.navigate(['/products']);
      }
    }, 1000);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Navigate to signup (if available)
   */
  goToSignup(): void {
    // this.router.navigate(['/signup']);
    alert('Signup page coming soon!');
  }
}
