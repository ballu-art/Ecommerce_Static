import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  bannerImages = [
    '/images/b1.png',
    '/images/b2.png',
    '/images/b3.png',
    '/images/b4.png',
    '/images/b5.png'
    , 
  ];
  clients = [
  { name: 'ULTRATECH',  logo: '/images/logos/ultratech.png'  },
  { name: 'ACC',        logo: '/images/logos/acc.jpeg'        },
  { name: 'AMBUJA',     logo: '/images/logos/ambuja.png'     },
  { name: 'PIDILITE',   logo: '/images/logos/pidilite.png'   },
  { name: 'BERGER',     logo: '/images/logos/berger.png'     },
  { name: 'ASIAN',      logo: '/images/logos/asian.png'      },
  { name: 'SAINT-GOBAIN', logo: '/images/logos/saint-gobain.png' },
  { name: 'JOHNSON',    logo: '/images/logos/johnson.png'    },
  { name: 'KAJARIA',    logo: '/images/logos/kajaria.png'    },
  { name: 'SOMANY',     logo: '/images/logos/somany.png'     },
];

testimonials = [
  { tag: 'Tile Adhesive',   initial: 'C', name: 'Contractor',    role: 'Construction Professional', text: 'We have been using BONDMASTER tile adhesives for multiple projects, and the bonding strength is outstanding. Easy to apply and highly reliable.' },
  { tag: 'Waterproofing',   initial: 'B', name: 'Builder',       role: 'Civil Construction',        text: 'BONDMASTER products have consistently delivered great results. Their waterproofing solutions are especially effective and long-lasting.' },
  { tag: 'Technical Support', initial: 'S', name: 'Site Engineer', role: 'Project Management',      text: 'The technical team is very supportive and guides us with the right product selection. It makes our work much easier.' },
  { tag: 'Value for Money', initial: 'D', name: 'Dealer',        role: 'Building Materials',        text: 'High-quality products at competitive pricing. We prefer BONDMASTER for most of our construction needs.' },
  { tag: 'Repair Products', initial: 'A', name: 'Architect',     role: 'Design & Construction',     text: 'From tile adhesives to repair products, everything performs as promised. Highly recommended for professional use.' },
];
  
current = 0;
private timer: any;
  currentImageIndex = 0;
  autoRotateInterval: any;
  
  ngOnInit() {
    this.startAutoRotate();
    this.startAuto();
  }
  
  ngOnDestroy() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
    }
    clearInterval(this.timer);
  }
  goTo(n: number) {
  this.current = (n + this.testimonials.length) % this.testimonials.length;
  this.startAuto();
}
prev() { this.goTo(this.current - 1); }
next() { this.goTo(this.current + 1); }

private startAuto() {
  clearInterval(this.timer);
  this.timer = setInterval(() => this.next(), 4500);
}
  
  startAutoRotate() {
    this.autoRotateInterval = setInterval(() => {
      this.nextImage();
    }, 5000); // Rotate every 5 seconds
  }
  
  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.bannerImages.length;
  }
  
  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.bannerImages.length) % this.bannerImages.length;
  }
  
  goToImage(index: number) {
    this.currentImageIndex = index;
    // Reset auto-rotate timer when manually navigating
    clearInterval(this.autoRotateInterval);
    this.startAutoRotate();
  }
}

