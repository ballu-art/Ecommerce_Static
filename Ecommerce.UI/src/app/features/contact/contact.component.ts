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
  whatsappNumber = '918401777499'; // +91 84017 77499

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

  openWhatsApp() {
    if (this.formData.name && this.formData.email && this.formData.message) {
      // Create professionally formatted message with classic design
      const whatsappMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    NEW INQUIRY FROM WEBSITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

*SENDER INFORMATION*
Name: ${this.formData.name}
Email: ${this.formData.email}

*INQUIRY DETAILS*
Subject: ${this.formData.subject || 'General Inquiry'}

*MESSAGE*
${this.formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for reaching out!
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage.trim());
      
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      this.errorMessage = 'Please fill in all required fields (Name, Email, Message).';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }
}
