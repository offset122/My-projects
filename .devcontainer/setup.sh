#!/bin/bash

echo "🚀 Setting up EarnQuest development environment..."

# Make script executable
chmod +x .devcontainer/setup.sh

# Set up backend
echo "📦 Setting up Python backend..."
cd EarnQuest/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend .env file from example"
fi

# Initialize database
echo "🗄️ Initializing database..."
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized!')"

cd ../..

# Set up mobile app
echo "📱 Setting up React Native mobile app..."
cd EarnQuest/mobile

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    # Update API_BASE_URL for Codespaces
    if [ -n "$CODESPACE_NAME" ]; then
        sed -i "s|http://localhost:5000/api|https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/api|g" .env
        echo "✅ Created mobile .env file with Codespaces URL"
    else
        echo "✅ Created mobile .env file (localhost for local development)"
    fi
fi

cd ../..

# Create development scripts
echo "📝 Creating development scripts..."

# Backend start script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Flask backend..."
cd EarnQuest/backend
source venv/bin/activate
export FLASK_ENV=development
python app.py
EOF

# Mobile start script
cat > start-mobile.sh << 'EOF'
#!/bin/bash
echo "📱 Starting React Native development server..."
cd EarnQuest/mobile
npm start
EOF

# Full development script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting EarnQuest development environment..."
echo "This will start both backend and mobile development servers"

# Function to get the correct URLs
get_backend_url() {
    if [ -n "$CODESPACE_NAME" ]; then
        echo "https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    else
        echo "http://localhost:5000"
    fi
}

get_mobile_url() {
    if [ -n "$CODESPACE_NAME" ]; then
        echo "https://${CODESPACE_NAME}-8081.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    else
        echo "http://localhost:8081"
    fi
}

# Start backend in background
echo "🔧 Starting Flask backend..."
./start-backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start mobile development server in background
echo "📱 Starting React Native Metro..."
./start-mobile.sh &
MOBILE_PID=$!

# Wait a bit more for services to start
sleep 3

echo ""
echo "✅ Development servers started!"
echo "📡 Backend API: $(get_backend_url)"
echo "📱 Mobile Metro: $(get_mobile_url)"
echo ""
echo "💡 Tips:"
echo "  - Use VS Code tasks (Ctrl+Shift+P → 'Tasks: Run Task') for better control"
echo "  - Check terminal output for any errors"
echo "  - Press Ctrl+C to stop this script and kill background processes"
echo ""
echo "🔄 Processes running:"
echo "  Backend PID: $BACKEND_PID"
echo "  Mobile PID: $MOBILE_PID"

# Wait for user to stop
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $MOBILE_PID 2>/dev/null; exit' INT
wait
EOF

# Make scripts executable
chmod +x start-backend.sh start-mobile.sh start-dev.sh

echo ""
echo "🎉 EarnQuest development environment setup complete!"
echo ""
echo "🚀 Quick Start Commands:"
echo "  ./start-dev.sh          - Start both backend and mobile servers"
echo "  ./start-backend.sh      - Start only Flask backend"
echo "  ./start-mobile.sh       - Start only React Native metro"
echo ""
echo "🌐 Your development URLs:"
echo "  Backend API: https://$CODESPACE_NAME-5000.app.github.dev"
echo "  Mobile Metro: https://$CODESPACE_NAME-8081.app.github.dev"
echo ""
echo "📱 To test on your phone:"
echo "  1. Install Expo Go app"
echo "  2. Run './start-mobile.sh'"
echo "  3. Scan QR code with Expo Go"
echo ""
echo "✅ Ready to start developing!"
