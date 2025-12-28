#!/bin/bash

# Chimera Trading System - Deployment Script
# Supports 4 deployment methods:
# 1. GitHub Pages (Static frontend only)
# 2. Hybrid (GitHub Pages + External backend server)
# 3. Full Server (Complete deployment on single server)
# 4. Railway/Cloud (Cloud platform deployment)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="www.aiwebe.online"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Chimera Trading System - Deployment Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠ Warning: .env file not found${NC}"
    echo -e "Creating .env from .env.example..."
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    echo -e "${GREEN}✓ Created .env file - please edit it with your credentials${NC}"
    echo ""
fi

# Display deployment options
echo "Select deployment method:"
echo ""
echo -e "${GREEN}1)${NC} GitHub Pages Only (Static frontend)"
echo "   - Deploys only the React dashboard to GitHub Pages"
echo "   - No backend required (uses demo mode)"
echo "   - Best for: Testing and demo purposes"
echo ""
echo -e "${GREEN}2)${NC} Hybrid Deployment (GitHub Pages + External Backend)"
echo "   - Frontend on GitHub Pages"
echo "   - Backend on your own server"
echo "   - Best for: Small to medium deployments"
echo ""
echo -e "${GREEN}3)${NC} Full Server Deployment"
echo "   - Complete deployment on a single server"
echo "   - Includes nginx, systemd services"
echo "   - Best for: Production deployments with VPS/dedicated server"
echo ""
echo -e "${GREEN}4)${NC} Railway/Cloud Deployment"
echo "   - Deploy to Railway, Heroku, or similar platform"
echo "   - Automated scaling and management"
echo "   - Best for: Quick deployment and auto-scaling"
echo ""
echo -e "${GREEN}0)${NC} Exit"
echo ""

read -p "Enter your choice (0-4): " choice

case $choice in
    1)
        echo -e "\n${BLUE}━━━ Method 1: GitHub Pages Deployment ━━━${NC}\n"
        
        # Check if gh-pages is installed
        if ! npm list gh-pages &> /dev/null; then
            echo "Installing gh-pages..."
            npm install --save-dev gh-pages
        fi
        
        # Build the project
        echo -e "${YELLOW}Building project...${NC}"
        npm run build
        
        # Create CNAME file if it doesn't exist
        if [ ! -f "$PROJECT_DIR/dist/CNAME" ]; then
            echo "$DOMAIN" > "$PROJECT_DIR/dist/CNAME"
            echo -e "${GREEN}✓ Created CNAME file with domain: $DOMAIN${NC}"
        fi
        
        # Deploy to GitHub Pages
        echo -e "${YELLOW}Deploying to GitHub Pages...${NC}"
        npm run deploy
        
        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ Deployment Complete!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "\nYour site will be available at: ${BLUE}https://$DOMAIN${NC}"
        echo -e "Note: DNS propagation may take a few minutes"
        echo -e "\n${YELLOW}⚠ Running in DEMO MODE (no backend)${NC}"
        ;;
        
    2)
        echo -e "\n${BLUE}━━━ Method 2: Hybrid Deployment ━━━${NC}\n"
        
        # Deploy frontend to GitHub Pages
        echo -e "${YELLOW}Step 1: Deploying frontend to GitHub Pages...${NC}"
        npm run build
        
        if [ ! -f "$PROJECT_DIR/dist/CNAME" ]; then
            echo "$DOMAIN" > "$PROJECT_DIR/dist/CNAME"
        fi
        
        npm run deploy
        echo -e "${GREEN}✓ Frontend deployed to GitHub Pages${NC}\n"
        
        # Backend deployment instructions
        echo -e "${YELLOW}Step 2: Backend Deployment${NC}"
        echo "Run the following on your backend server:"
        echo ""
        echo -e "${BLUE}./backend-deploy.sh${NC}"
        echo ""
        echo "Or manually:"
        echo -e "1. Copy .env file and edit with your credentials"
        echo -e "2. Install dependencies: ${BLUE}npm install && pip install -r requirements.txt${NC}"
        echo -e "3. Start Node.js backend: ${BLUE}npm run server${NC}"
        echo -e "4. Start Python backend: ${BLUE}python unified_system_with_exchanges.py${NC}"
        echo ""
        echo -e "${GREEN}✓ Hybrid deployment initiated${NC}"
        ;;
        
    3)
        echo -e "\n${BLUE}━━━ Method 3: Full Server Deployment ━━━${NC}\n"
        
        # Check if running with sudo
        if [ "$EUID" -ne 0 ]; then
            echo -e "${RED}✗ This method requires sudo privileges${NC}"
            echo "Please run: sudo ./deploy.sh"
            exit 1
        fi
        
        echo -e "${YELLOW}Installing dependencies...${NC}"
        
        # Install Node.js dependencies
        npm install
        
        # Install Python dependencies
        if [ -f "$PROJECT_DIR/requirements.txt" ]; then
            pip3 install -r requirements.txt
        else
            echo -e "${YELLOW}⚠ requirements.txt not found, skipping Python dependencies${NC}"
        fi
        
        # Build the project
        echo -e "${YELLOW}Building project...${NC}"
        npm run build
        
        # Install nginx if not present
        if ! command -v nginx &> /dev/null; then
            echo -e "${YELLOW}Installing nginx...${NC}"
            apt-get update
            apt-get install -y nginx
        fi
        
        # Copy nginx configuration
        if [ -f "$PROJECT_DIR/nginx-config.conf" ]; then
            echo -e "${YELLOW}Configuring nginx...${NC}"
            cp "$PROJECT_DIR/nginx-config.conf" "/etc/nginx/sites-available/chimera"
            ln -sf "/etc/nginx/sites-available/chimera" "/etc/nginx/sites-enabled/"
            
            # Replace placeholders in nginx config
            sed -i "s/{{DOMAIN}}/$DOMAIN/g" "/etc/nginx/sites-available/chimera"
            
            # Test nginx configuration
            nginx -t
            
            # Reload nginx
            systemctl reload nginx
            echo -e "${GREEN}✓ Nginx configured${NC}"
        fi
        
        # Install systemd services
        if [ -f "$PROJECT_DIR/systemd/chimera-web.service" ]; then
            echo -e "${YELLOW}Installing systemd services...${NC}"
            cp "$PROJECT_DIR/systemd/chimera-web.service" "/etc/systemd/system/"
            cp "$PROJECT_DIR/systemd/chimera-backend.service" "/etc/systemd/system/"
            
            # Replace placeholders
            sed -i "s|{{PROJECT_DIR}}|$PROJECT_DIR|g" "/etc/systemd/system/chimera-web.service"
            sed -i "s|{{PROJECT_DIR}}|$PROJECT_DIR|g" "/etc/systemd/system/chimera-backend.service"
            
            # Reload systemd
            systemctl daemon-reload
            
            # Enable and start services
            systemctl enable chimera-web chimera-backend
            systemctl start chimera-web chimera-backend
            
            echo -e "${GREEN}✓ Systemd services installed and started${NC}"
        fi
        
        # Setup Dynamic DNS if script exists
        if [ -f "$PROJECT_DIR/setup-dynamic-dns.sh" ]; then
            echo -e "${YELLOW}Setting up Dynamic DNS...${NC}"
            bash "$PROJECT_DIR/setup-dynamic-dns.sh"
        fi
        
        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ Full Server Deployment Complete!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "\nServices Status:"
        systemctl status chimera-web --no-pager | grep "Active:"
        systemctl status chimera-backend --no-pager | grep "Active:"
        echo -e "\nYour site is available at: ${BLUE}https://$DOMAIN${NC}"
        echo -e "Backend API: ${BLUE}http://$DOMAIN/api${NC}"
        echo -e "WebSocket: ${BLUE}ws://$DOMAIN:8080${NC}"
        echo -e "Metrics: ${BLUE}http://$DOMAIN:9090/metrics${NC}"
        ;;
        
    4)
        echo -e "\n${BLUE}━━━ Method 4: Railway/Cloud Deployment ━━━${NC}\n"
        
        echo "Railway Deployment:"
        echo ""
        echo "1. Install Railway CLI:"
        echo -e "   ${BLUE}npm install -g @railway/cli${NC}"
        echo ""
        echo "2. Login to Railway:"
        echo -e "   ${BLUE}railway login${NC}"
        echo ""
        echo "3. Initialize project:"
        echo -e "   ${BLUE}railway init${NC}"
        echo ""
        echo "4. Set environment variables:"
        echo -e "   ${BLUE}railway variables set $(cat .env | grep -v '^#' | grep -v '^$' | xargs)${NC}"
        echo ""
        echo "5. Deploy:"
        echo -e "   ${BLUE}railway up${NC}"
        echo ""
        echo "Or use the Railway Dashboard:"
        echo "1. Go to https://railway.app/"
        echo "2. Create new project from GitHub repo"
        echo "3. Add environment variables from .env.example"
        echo "4. Deploy automatically"
        echo ""
        echo -e "${GREEN}✓ Instructions provided${NC}"
        ;;
        
    0)
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}✗ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Deployment process completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
