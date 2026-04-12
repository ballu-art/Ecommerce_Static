# Portfolio Website

A modern, responsive company product portfolio website built with Angular 20 and featuring a classic template design.

## Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Home Page**: Hero section with company features and call-to-action buttons
- **Products/Services Page**: Showcase of 6 services with descriptions
- **About Page**: Company story, core values, and team section
- **Contact Page**: Contact information and inquiry form
- **Navigation**: Sticky header with navigation menu

## Project Structure

```
src/
├── app/
│   ├── features/          # Feature-specific components
│   │   ├── home/
│   │   ├── products/
│   │   ├── about/
│   │   └── contact/
│   ├── shared/            # Shared components
│   │   ├── header/
│   │   └── footer/
│   ├── app.ts            # Root component
│   └── app.routes.ts     # Application routes
├── styles.css            # Global styles with utility classes
└── index.html            # HTML entry point
```

## Development Server

To start a local development server, run:

```bash
npm start
# or
ng serve
```

The application will automatically open at `http://localhost:4200/`. The application reloads whenever you modify source files.

## Building for Production

To build the project for production, run:

```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Technologies Used

- **Angular 20**: Modern web framework
- **TypeScript**: For type-safe development
- **CSS Utilities**: Custom CSS utility classes for styling
- **Responsive Design**: Media queries for mobile compatibility

## Customization

### Colors
Edit the CSS custom properties in `src/styles.css`:
```css
:root {
  --primary: #2563eb;        /* Primary blue */
  --gray-900: #111827;       /* Dark gray */
  /* ... more colors ... */
}
```

### Content
- Edit homepage content in `src/app/features/home/`
- Modify product listings in `src/app/features/products/products.component.ts`
- Update company info in `src/app/features/about/`
- Customize contact details in `src/app/features/contact/`

### Pages
Add new pages by generating components and adding routes to `src/app/app.routes.ts`:
```bash
ng generate component features/new-page
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests

## License

This project is provided as-is for portfolio purposes.


```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
