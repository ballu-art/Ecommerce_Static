import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  providers: [EmailService]
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(private emailService: EmailService) {}

  submitForm() {
    if (this.formData.name && this.formData.email && this.formData.message) {
      this.isLoading = true;
      this.errorMessage = '';

      this.emailService.sendEmail(this.formData).subscribe(
        (response) => {
          this.isLoading = false;
          this.submitted = true;
          // Reset form
          this.formData = { name: '', email: '', subject: '', message: '' };
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.submitted = false;
          }, 5000);
        },
        (error) => {
          this.isLoading = false;
          console.error('Email sending error:', error);
          this.errorMessage = 'Failed to send message. Please try again.';
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      );
    } else {
      this.errorMessage = 'Please fill in all required fields.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }
}
