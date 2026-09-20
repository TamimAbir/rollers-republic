# RollON Template Guide

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and update values
3. Install dependencies: `npm install`
4. Update `src/lib/config.ts` with your business details
5. Replace product data in `src/data/products.ts`
6. Customize theme in `tailwind.config.js`
7. Build and deploy: `npm run build`

## Customization Steps

### 1. Business Identity
Update `src/lib/config.ts`:
```typescript
export const siteConfig = {
  name: 'Your Business Name',
  description: 'Your business description',
  // ... other config
};
```

### 2. Branding
Update `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### 3. Products
Replace `src/data/products.ts` with your product catalog.

### 4. Images
Replace images in `public/assets/` with your brand assets.

### 5. Contact Information
Update contact details in `src/components/layout/Footer.tsx` and `src/pages/Contact.tsx`.

## Deployment

### Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app is a static React app that can be deployed anywhere that serves static files.

## Support
For questions or issues, please refer to the repository documentation.