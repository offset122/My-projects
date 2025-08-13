# 🚀 EarnQuest GitHub Codespaces Guide

Welcome to your cloud-based EarnQuest development environment! Everything is pre-configured and ready to use.

## 🎯 Quick Start

### 1. **Start Development Environment**
```bash
./start-dev.sh
```
This starts both the Flask backend and React Native mobile development servers.

### 2. **Access Your Applications**
- **Backend API**: `https://your-codespace-5000.app.github.dev`
- **Mobile Metro**: `https://your-codespace-8081.app.github.dev`
- **API Health Check**: `https://your-codespace-5000.app.github.dev/api/health`

## 🛠️ Individual Commands

### Backend Only
```bash
./start-backend.sh
```

### Mobile Only
```bash
./start-mobile.sh
```

### Manual Setup
```bash
# Backend
cd EarnQuest/backend
source venv/bin/activate
python app.py

# Mobile (new terminal)
cd EarnQuest/mobile
npm start
```

## 📱 Testing on Your Phone

### Option 1: Expo Go (Recommended)
1. Install **Expo Go** app on your phone
2. Run `./start-mobile.sh`
3. Scan the QR code with Expo Go
4. App will load on your phone!

### Option 2: Web Browser
1. Open the Mobile Metro URL in your browser
2. Click "Run in web browser"
3. Test the app directly in browser

## 🔧 Development Workflow

### Making Changes
1. **Backend**: Edit files in `EarnQuest/backend/`
   - Flask auto-reloads on file changes
   - Check terminal for errors

2. **Mobile**: Edit files in `EarnQuest/mobile/src/`
   - Metro bundler auto-reloads
   - Shake phone or press 'r' to reload

### Database Management
```bash
cd EarnQuest/backend
source venv/bin/activate

# Reset database
python -c "from app import app, db; app.app_context().push(); db.drop_all(); db.create_all()"

# Check database
python -c "from app import app, db, User; app.app_context().push(); print(f'Users: {User.query.count()}')"
```

### Installing New Packages
```bash
# Backend
cd EarnQuest/backend
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt

# Mobile
cd EarnQuest/mobile
npm install package-name
```

## 🌐 Environment Configuration

### Backend (.env)
Located at `EarnQuest/backend/.env`:
```env
FLASK_ENV=development
SECRET_KEY=dev-secret-key
DATABASE_URL=sqlite:///earnquest.db
# Add your API keys here
```

### Mobile (.env)
Located at `EarnQuest/mobile/.env`:
```env
API_BASE_URL=https://your-codespace-5000.app.github.dev/api
API_TIMEOUT=10000
```

## 🔍 Debugging

### Backend Logs
- Check the terminal running `start-backend.sh`
- Flask errors appear in real-time

### Mobile Logs
- Check the terminal running `start-mobile.sh`
- Use browser dev tools for web testing
- Shake phone → "Debug" for mobile debugging

### Common Issues

**Backend not starting?**
```bash
cd EarnQuest/backend
source venv/bin/activate
pip install -r requirements.txt
```

**Mobile not connecting?**
- Check if backend is running first
- Verify the API_BASE_URL in mobile/.env
- Try refreshing the Metro bundler

**Database errors?**
```bash
cd EarnQuest/backend
source venv/bin/activate
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

## 🚀 Building for Production

### Android APK
```bash
cd EarnQuest/mobile
npx react-native run-android --variant=release
```

### Deploy Backend
```bash
# Already configured for Railway
git push origin main
```

## 💡 Pro Tips

1. **Multiple Terminals**: Use VS Code's integrated terminal tabs
2. **Port Forwarding**: Codespaces automatically forwards ports 5000, 8081
3. **File Watching**: Both servers auto-reload on changes
4. **Git Integration**: Full Git support built-in
5. **Extensions**: Pre-installed Python, React Native, and development extensions

## 🆘 Need Help?

- **Backend Issues**: Check `EarnQuest/backend/` logs
- **Mobile Issues**: Check Metro bundler terminal
- **Database Issues**: Reset with the commands above
- **Port Issues**: Check if services are running on correct ports

## 🎉 You're Ready!

Your EarnQuest development environment is fully configured and ready for development. Happy coding! 🚀

---

**Quick Commands Reference:**
- `./start-dev.sh` - Start everything
- `./start-backend.sh` - Backend only
- `./start-mobile.sh` - Mobile only
- `Ctrl+C` - Stop servers
