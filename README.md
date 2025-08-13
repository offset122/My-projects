# EarnQuest - Kenyan Survey & Rewards Platform

EarnQuest is a mobile application that connects Kenyan users with paid surveys through CPX Research API integration.

## 🌟 Features

- 📱 Cross-platform mobile app (React Native)
- 🔐 Secure user authentication with JWT
- 📊 Real-time survey access via CPX Research API
- 💰 Earnings tracking and rewards dashboard
- 💳 M-PESA and PayPal payment integration
- 🛡️ Fraud prevention and duplicate account checks
- 🇰🇪 Kenyan market focus with global survey access

## 🚀 Quick Start with GitHub Codespaces

### **Option 1: One-Click Development (Recommended)**

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/offset122/My-projects)

1. Click the badge above or go to your repository
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Wait for the environment to set up (2-3 minutes)
4. Run `./start-dev.sh` to start both backend and mobile servers
5. Your apps will be available at the forwarded ports!

### **Option 2: Local Development**

```bash
# Backend Setup
cd EarnQuest/backend
pip install -r requirements.txt
cp .env.example .env
python app.py

# Mobile App Setup (new terminal)
cd EarnQuest/mobile
npm install
cp .env.example .env
npm start
```

## 🌐 Live Demo & Deployment

- **API Backend**: https://earnquest-backend.railway.app
- **Health Check**: https://earnquest-backend.railway.app/api/health
- **GitHub Codespaces**: Full development environment in your browser

## 📁 Project Structure

```
EarnQuest/
├── backend/               # Flask API server
│   ├── routes/           # API endpoints
│   ├── models.py         # Database models
│   ├── app.py           # Main application
│   └── requirements.txt  # Python dependencies
├── mobile/               # React Native mobile app
│   ├── src/             # Source code
│   ├── android/         # Android build files
│   └── package.json     # Node dependencies
├── .devcontainer/       # GitHub Codespaces configuration
├── .github/workflows/   # CI/CD pipelines
└── DEPLOYMENT.md        # Deployment guide
```

## 🛠️ Development Options

### **🌐 GitHub Codespaces (Recommended)**
- ✅ **Zero setup** - everything pre-configured
- ✅ **Cloud development** - code from any device
- ✅ **Automatic port forwarding** for testing
- ✅ **Pre-installed tools** - Python, Node.js, Android SDK
- ✅ **VS Code integration** with extensions

**Quick Commands in Codespaces:**
```bash
./start-dev.sh          # Start both backend and mobile
./start-backend.sh      # Start only Flask API
./start-mobile.sh       # Start only React Native
```

### **💻 Local Development**
Perfect for offline development and full control.

### **🚀 Production Deployment**
- **Backend**: Railway (automatic deployments)
- **Mobile**: APK builds via GitHub Actions
- **CI/CD**: GitHub Actions with tests

## 📱 Mobile App Features

### Authentication
- Secure registration with Kenyan phone validation
- County selection during signup
- JWT-based session management

### Dashboard
- Real-time earnings overview
- Recent activity feed
- Quick action buttons

### Surveys
- Browse available surveys
- Detailed survey information
- WebView integration for completion
- Automatic reward calculation

### Rewards
- Comprehensive earnings history
- Reward breakdown by type
- Leaderboard (anonymized)
- Daily bonus system

### Payments
- M-PESA withdrawal support
- PayPal international payments
- Transaction history
- Real-time balance updates

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **Phone Verification**: Kenyan phone number validation
- **Fraud Prevention**: Duplicate account detection
- **CORS Protection**: Configured for production domains

## 🇰🇪 Kenya-Specific Features

- **Phone Numbers**: Supports all Kenyan mobile formats
- **Counties**: Complete list of Kenyan counties
- **Currency**: KES formatting throughout
- **M-PESA**: Native mobile money integration
- **Local Market**: Surveys targeted for Kenyan users

## 🛡️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Surveys
- `GET /api/surveys/available` - Get available surveys
- `POST /api/surveys/start/{id}` - Start a survey
- `POST /api/surveys/complete/{id}` - Complete a survey

### Rewards
- `GET /api/rewards/dashboard` - Rewards dashboard
- `GET /api/rewards/history` - Reward history
- `POST /api/rewards/bonus` - Claim daily bonus

### Payments
- `GET /api/payments/methods` - Available payment methods
- `POST /api/payments/withdraw` - Process withdrawal
- `GET /api/payments/transactions` - Transaction history

## 🔧 Configuration

### Required Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
CPX_RESEARCH_API_KEY=your-cpx-api-key
MPESA_CONSUMER_KEY=your-mpesa-key
PAYPAL_CLIENT_ID=your-paypal-id
```

#### Mobile (.env)
```env
API_BASE_URL=https://your-api-domain.railway.app/api
```

## 📊 Database Schema

### Users
- Personal information and authentication
- Earnings and survey statistics
- Verification status

### Surveys
- Survey metadata and status
- User completion tracking
- Reward amounts

### Rewards
- Reward history and types
- Approval status
- Transaction references

### Transactions
- Payment processing records
- External payment references
- Audit trail

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md) for setup instructions
- **Codespaces Guide**: See [.github/CODESPACES.md](.github/CODESPACES.md)
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Email**: support@earnquest.co.ke (when live)

## 🎯 Roadmap

- [x] Complete mobile app with all features
- [x] Production-ready backend API
- [x] GitHub Codespaces development environment
- [x] Railway deployment with CI/CD
- [ ] iOS app development
- [ ] Advanced survey targeting
- [ ] Push notifications
- [ ] Offline survey caching
- [ ] Advanced analytics dashboard

---

**Made with ❤️ for Kenya 🇰🇪**

*EarnQuest - Empowering Kenyans to earn through their opinions*

## 🚀 Get Started Now!

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/offset122/My-projects)

Click above to start developing in the cloud instantly! 🌟
