# RollON Architecture

## Overview
RollON is a configuration-driven e-commerce template built with React, TypeScript, and Tailwind CSS. It's designed to be customizable for different businesses while maintaining a single codebase.

## Core Architecture

### Configuration Layer
- `src/lib/config.ts` - Centralized site configuration
- `.env.example` - Environment variable templates
- `public/config.json` - Runtime configuration (optional)

### Data Layer
- `src/data/products.ts` - Product catalog (can be replaced with API/CSV)
- `src/store/` - State management (Zustand)
- `src/lib/api.ts` - API integration layer

### Component System
- `src/components/ui/` - Reusable UI components
- `src/components/layout/` - Layout components (Navbar, Footer)
- `src/components/sections/` - Page sections (Hero, FeaturedProducts)
- `src/components/shop/` - Shop-specific components

### Routing
- `src/App.tsx` - Main routing configuration
- `src/pages/` - Page components

### Styling
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles and CSS variables
- Theme system via CSS custom properties

## Deployment
- Vercel recommended
- SPA routing via `vercel.json`
- Environment variables for configuration

## Customization Guide
See TEMPLATE_GUIDE.md for step-by-step customization instructions.