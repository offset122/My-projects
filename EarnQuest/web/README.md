# EarnQuest Web App

This is the web version of EarnQuest - a Kenyan survey and rewards platform built with Next.js.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE_URL=https://earnquest-backend.railway.app/api`
3. Deploy automatically on every push to main

### Manual Deployment
```bash
npm run build
npm run export
```

## 🔧 Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=https://earnquest-backend.railway.app/api
NEXT_PUBLIC_APP_NAME=EarnQuest
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📱 Features

- Responsive design for mobile and desktop
- User authentication and registration
- Survey browsing and completion
- Rewards tracking and history
- Withdrawal system (M-PESA and PayPal)
- Profile management
- Real-time balance updates

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons
- **TypeScript**: Full type safety

## 🔗 API Integration

The web app connects to the EarnQuest backend API hosted on Railway:
- Base URL: `https://earnquest-backend.railway.app/api`
- Authentication: JWT tokens stored in cookies
- Real-time updates via API polling

## 📊 Performance

- Optimized for Core Web Vitals
- Server-side rendering with Next.js
- Automatic code splitting
- Image optimization
- Progressive Web App features

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - see LICENSE file for details.
