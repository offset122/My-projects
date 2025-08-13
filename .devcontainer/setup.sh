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
    sed -i 's|http://localhost:5000/api|https://$CODESPACE_NAME-5000.app.github.dev/api|g' .env
    echo "✅ Created mobile .env file with Codespaces URL"
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

# Start backend in background
gnome-terminal --tab --title="Backend" -- bash -c "./start-backend.sh; exec bash"

# Wait a moment for backend to start
sleep 3

# Start mobile development server
gnome-terminal --tab --title="Mobile" -- bash -c "./start-mobile.sh; exec bash"

echo "✅ Development servers starting..."
echo "📡 Backend API: https://$CODESPACE_NAME-5000.app.github.dev"
echo "📱 Mobile Metro: https://$CODESPACE_NAME-8081.app.github.dev"
echo ""
echo "💡 Tips:"
echo "  - Use 'Ctrl+C' to stop servers"
echo "  - Check the terminal tabs for logs"
echo "  - API will be available at the backend URL above"
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
