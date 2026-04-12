import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  features: string[];
  specifications: { [key: string]: string };
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  selectedColor: string = 'Standard';
  selectedPackage: string = 'Basic';

  products: { [key: number]: Product } = {
    1: {
      id: 1,
      name: 'Web Development Solutions',
      description: 'Custom web applications built with modern technologies and best practices',
      longDescription: 'Our comprehensive web development solutions are designed to transform your digital presence. We build scalable, secure, and user-friendly web applications using the latest technologies and industry best practices.',
      price: 'Contact for Quote',
      rating: 4.5,
      reviews: 128,
      image: '💻',
      badge: 'Popular',
      features: [
        'Responsive Design for all devices',
        'SEO Optimized',
        'Fast Loading Speed',
        'Secure and Scalable',
        'Regular Updates and Support',
        'API Integration',
        'Payment Gateway Integration',
        'Admin Dashboard'
      ],
      specifications: {
        'Technology Stack': 'Angular, React, Node.js, Python',
        'Database': 'PostgreSQL, MongoDB, MySQL',
        'Deployment': 'AWS, Azure, Google Cloud',
        'Support': '24/7 Email & Phone Support',
        'Warranty': '2 Years free maintenance',
        'Development Time': '4-12 weeks'
      }
    },
    2: {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications for iOS and Android',
      longDescription: 'Create powerful mobile applications that engage users and drive business growth. We develop native iOS and Android apps, as well as cross-platform solutions that work seamlessly across all devices.',
      price: 'Contact for Quote',
      rating: 4.7,
      reviews: 95,
      image: '📱',
      badge: undefined,
      features: [
        'iOS & Android Development',
        'Cross-platform Apps',
        'Offline Functionality',
        'Push Notifications',
        'App Store Optimization',
        'Real-time Synchronization',
        'Advanced Security Features',
        'Analytics Integration'
      ],
      specifications: {
        'Platforms': 'iOS, Android, React Native, Flutter',
        'Design': 'UI/UX Included',
        'Features': 'Custom Features Available',
        'Support': '24/7 Support & Updates',
        'Warranty': '1 Year free updates',
        'Development Time': '3-10 weeks'
      }
    },
    3: {
      id: 3,
      name: 'Cloud Infrastructure',
      description: 'Scalable cloud solutions with AWS, Azure, and Google Cloud',
      longDescription: 'Leverage the power of cloud computing to scale your business. We provide comprehensive cloud infrastructure services including setup, migration, and management on major cloud platforms.',
      price: 'Contact for Quote',
      rating: 4.8,
      reviews: 112,
      image: '☁️',
      badge: 'Best Seller',
      features: [
        'Auto-scaling Infrastructure',
        'High Availability',
        'Disaster Recovery',
        'Data Backup & Recovery',
        'Load Balancing',
        'DDoS Protection',
        'SSL/TLS Encryption',
        'Cost Optimization'
      ],
      specifications: {
        'Cloud Providers': 'AWS, Azure, Google Cloud',
        'Uptime': '99.99% SLA',
        'Security': 'Enterprise-grade Security',
        'Support': '24/7 Monitoring & Support',
        'Backup': 'Daily Automated Backups',
        'Compliance': 'ISO 27001, SOC 2 Certified'
      }
    },
    4: {
      id: 4,
      name: 'Data Analytics & BI',
      description: 'Business intelligence and advanced data-driven insights',
      longDescription: 'Transform raw data into actionable insights. Our data analytics solutions help you understand customer behavior, identify trends, and make data-driven business decisions.',
      price: 'Contact for Quote',
      rating: 4.6,
      reviews: 87,
      image: '📊',
      badge: undefined,
      features: [
        'Custom Dashboards',
        'Real-time Analytics',
        'Predictive Analytics',
        'Data Visualization',
        'Machine Learning Models',
        'Report Generation',
        'Data Integration',
        'Performance Optimization'
      ],
      specifications: {
        'Tools': 'Tableau, Power BI, Looker',
        'Data Sources': 'Multiple data sources supported',
        'Processing': 'Big Data Processing',
        'Support': '24/7 Technical Support',
        'Training': 'User Training Included',
        'Customization': 'Fully Customizable'
      }
    },
    5: {
      id: 5,
      name: 'AI & Machine Learning',
      description: 'AI-powered solutions for business automation and optimization',
      longDescription: 'Implement cutting-edge AI and machine learning technologies to automate processes, improve efficiency, and gain competitive advantage. Our expert team designs and deploys custom AI solutions.',
      price: 'Contact for Quote',
      rating: 4.9,
      reviews: 134,
      image: '🤖',
      badge: 'Trending',
      features: [
        'Custom ML Models',
        'NLP Implementation',
        'Computer Vision',
        'Chatbot Development',
        'Predictive Analytics',
        'Automation Scripts',
        'Model Training & Testing',
        'Deployment & Monitoring'
      ],
      specifications: {
        'Technologies': 'TensorFlow, PyTorch, Scikit-learn',
        'Languages': 'Python, JavaScript, Java',
        'Data Processing': 'Large Scale Data Processing',
        'Support': 'Ongoing Support Included',
        'Model Accuracy': 'Up to 95%+ Accuracy',
        'Scalability': 'Enterprise-grade Scalable'
      }
    },
    6: {
      id: 6,
      name: 'Strategic Consulting',
      description: 'Technology consulting and digital transformation planning',
      longDescription: 'Get expert guidance on digital transformation. Our consultants work with you to develop strategies that align technology with your business goals and drive sustainable growth.',
      price: 'Contact for Quote',
      rating: 4.4,
      reviews: 76,
      image: '💡',
      badge: undefined,
      features: [
        'Digital Strategy Planning',
        'Technology Assessment',
        'Process Optimization',
        'Risk Analysis',
        'Cost Reduction Strategies',
        'Implementation Roadmap',
        'Change Management',
        'ROI Planning'
      ],
      specifications: {
        'Expertise': '10+ Years Industry Experience',
        'Scope': 'Enterprise-wide Consulting',
        'Duration': 'Custom Timeline',
        'Deliverables': 'Detailed Strategy Reports',
        'Follow-up': '6 Months Post-implementation',
        'Success Rate': '95% Client Satisfaction'
      }
    },
    7: {
      id: 7,
      name: 'E-commerce Solutions',
      description: 'Complete e-commerce platforms with payment integration',
      longDescription: 'Build a powerful online store that drives sales and delights customers. Our e-commerce solutions include storefront design, payment processing, inventory management, and marketing tools.',
      price: 'Contact for Quote',
      rating: 4.7,
      reviews: 103,
      image: '🛒',
      badge: undefined,
      features: [
        'Complete Shopping Cart',
        'Payment Gateway Integration',
        'Inventory Management',
        'Order Management',
        'Customer Analytics',
        'Shipping Integration',
        'Multi-currency Support',
        'Marketing Tools'
      ],
      specifications: {
        'Platforms': 'Shopify, WooCommerce, Custom',
        'Payment Methods': 'All Major Payment Gateways',
        'Product Management': 'Unlimited Products',
        'Support': '24/7 Technical Support',
        'Hosting': 'Secure Hosting Included',
        'Security': 'PCI-DSS Compliant'
      }
    },
    8: {
      id: 8,
      name: 'DevOps & CI/CD',
      description: 'Continuous integration and deployment automation services',
      longDescription: 'Accelerate your development lifecycle with our DevOps and CI/CD solutions. Automate testing, deployment, and monitoring to reduce time-to-market and improve code quality.',
      price: 'Contact for Quote',
      rating: 4.6,
      reviews: 89,
      image: '⚙️',
      badge: undefined,
      features: [
        'CI/CD Pipeline Setup',
        'Automated Testing',
        'Continuous Monitoring',
        'Log Analytics',
        'Performance Monitoring',
        'Version Control',
        'Deployment Automation',
        'Infrastructure as Code'
      ],
      specifications: {
        'Tools': 'Jenkins, GitLab CI, GitHub Actions',
        'Container Support': 'Docker, Kubernetes',
        'Monitoring': 'Prometheus, ELK Stack',
        'Support': '24/7 Monitoring & Support',
        'Uptime': '99.95% Guaranteed',
        'Deployment Time': 'Minutes to Production'
      }
    },
    9: {
      id: 9,
      name: 'Security Solutions',
      description: 'Cybersecurity and application security services',
      longDescription: 'Protect your business from cyber threats with our comprehensive security solutions. From penetration testing to security audits, we help you build a robust security posture.',
      price: 'Contact for Quote',
      rating: 4.8,
      reviews: 156,
      image: '🔒',
      badge: undefined,
      features: [
        'Security Audits',
        'Penetration Testing',
        'Vulnerability Assessment',
        'Code Review & Analysis',
        'Threat Detection',
        'Incident Response',
        'Security Training',
        'Compliance Certification'
      ],
      specifications: {
        'Standards': 'ISO 27001, OWASP, PCI-DSS',
        'Testing Methods': 'Black Box, White Box, Gray Box',
        'Certifications': 'Industry Certified Professionals',
        'Support': '24/7 Emergency Response',
        'Reports': 'Detailed Security Reports',
        'Warranty': '6 Months Free Support'
      }
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.products[id] || null;
  }

  openWhatsApp() {
    if (this.product) {
      const message = `Hi, I'm interested in ${this.product.name}. Can you provide me with a quotation and more details?`;
      const whatsappUrl = `https://wa.me/919099303330?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  addToCart() {
    alert(`${this.quantity} × ${this.product?.name} added to cart!`);
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
