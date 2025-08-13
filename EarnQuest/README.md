# EarnQuest - Kenyan Survey & Rewards Platform

EarnQuest is a mobile application that connects Kenyan users with paid surveys through CPX Research API integration.

## Features

- 📱 Cross-platform mobile app (React Native)
- 🔐 Secure user authentication
- 📊 Real-time survey access via CPX Research API
- 💰 Earnings tracking and rewards dashboard
- 💳 M-PESA and PayPal payment integration
- 🛡️ Fraud prevention and duplicate account checks
- 🇰🇪 Kenyan market focus with global survey access

## Project Structure

```
EarnQuest/
├── mobile/                 # React Native mobile app
├── backend/               # Flask API server
├── docs/                  # Documentation
└── README.md
```

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Mobile App Setup
```bash
cd mobile
npm install
npx react-native run-android  # or run-ios
```

## API Documentation

The backend provides RESTful APIs for:
- User authentication and profiles
- Survey management via CPX Research
- Rewards and earnings tracking
- Payment processing

## Environment Variables

Create `.env` files in both `backend/` and `mobile/` directories with your API keys and configuration.
