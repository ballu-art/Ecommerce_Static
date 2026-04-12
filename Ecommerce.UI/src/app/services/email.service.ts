import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Using FormSubmit.co API (free email service, no backend required)
  private submissionUrl = 'https://formsubmit.co/ajax/info@portfolio.com';

  constructor(private http: HttpClient) {}

  sendEmail(data: EmailData): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('_captcha', 'false');

    return this.http.post(this.submissionUrl, formData);
  }

  // Alternative method using a custom backend endpoint
  sendEmailViaBackend(data: EmailData): Observable<any> {
    return this.http.post('/api/send-email', data);
  }
}
