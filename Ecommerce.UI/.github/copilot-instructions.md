# Angular 20 Portfolio Website - Project Setup

This is an Angular 20 company product portfolio website with a classic template design.

## Project Overview
- **Framework**: Angular 20
- **Language**: TypeScript
- **Styling**: Custom CSS with utility classes
- **Build Tool**: Angular CLI
- **Features**: Responsive design, Product showcase, Company info, Contact form

## Project Structure

```
src/
├── app/
│   ├── features/
│   │   ├── home/          - Home page with hero and features
│   │   ├── products/      - Products/services showcase
│   │   ├── about/         - Company story and team
│   │   └── contact/       - Contact form and information
│   ├── shared/
│   │   ├── header/        - Navigation header
│   │   └── footer/        - Footer component
│   ├── app.ts             - Root component
│   └── app.routes.ts      - Route configuration
├── styles.css             - Global styles and utilities
└── index.html             - HTML entry point
```

## Development Status
- [x] Project scaffolded
- [x] Core structure customized
- [x] Dependencies installed
- [x] Build verified
- [x] Development server ready

## Running the Project

### Development Server
```bash
npm install
npm start
# or
ng serve
```

The application will open at `http://localhost:4200/`

### Production Build
```bash
npm run build
```

Output will be in the `dist/portfolio-website` directory.

## Available Commands

- `npm start` - Start development server with live reload
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests

## Customization Guide

### Adding New Pages
1. Generate a new component: `ng generate component features/page-name`
2. Add the route to `src/app/app.routes.ts`
3. Update navigation in header component

### Styling
- Global styles are in `src/styles.css`
- CSS utility classes mimic Tailwind for easy responsive design
- Update colors by modifying CSS custom properties

### Content
- Edit component templates (`.html` files) directly
- Update data in component TypeScript files (`.ts` files)
- Modify product list in `src/app/features/products/products.component.ts`

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design

