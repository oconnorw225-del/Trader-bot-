#!/bin/bash

# Dynamic DNS Setup Script
# Configures Dynamic DNS for www.aiwebe.online

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Dynamic DNS Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Configuration
DOMAIN="www.aiwebe.online"
HOSTNAME="aiwebe.online"
DDNS_PASSWORD="d35bacbf38f245a1901f365b41110567"

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}✗ This script requires sudo privileges${NC}"
    echo "Please run: sudo ./setup-dynamic-dns.sh"
    exit 1
fi

# Select DDNS provider
echo "Select Dynamic DNS provider:"
echo ""
echo -e "${GREEN}1)${NC} No-IP (noip.com)"
echo -e "${GREEN}2)${NC} DynDNS (dyn.com)"
echo -e "${GREEN}3)${NC} Cloudflare"
echo -e "${GREEN}4)${NC} Manual configuration"
echo -e "${GREEN}0)${NC} Skip"
echo ""

read -p "Enter your choice (0-4): " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Installing No-IP client...${NC}"
        
        # Install dependencies
        apt-get update
        apt-get install -y build-essential
        
        # Download and install noip2
        cd /tmp
        wget https://www.noip.com/client/linux/noip-duc-linux.tar.gz
        tar xzf noip-duc-linux.tar.gz
        cd noip-*
        make
        make install
        
        # Configure noip2
        echo -e "${YELLOW}Configuring No-IP client...${NC}"
        echo "Use these credentials:"
        echo "  Domain: $DOMAIN"
        echo "  Password: $DDNS_PASSWORD"
        /usr/local/bin/noip2 -C
        
        # Create systemd service
        cat > /etc/systemd/system/noip2.service << EOF
[Unit]
Description=No-IP Dynamic DNS Update Client
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/noip2
Restart=always

[Install]
WantedBy=multi-user.target
EOF
        
        systemctl daemon-reload
        systemctl enable noip2
        systemctl start noip2
        
        echo -e "${GREEN}✓ No-IP client installed and started${NC}"
        ;;
        
    2)
        echo -e "\n${YELLOW}Configuring DynDNS with ddclient...${NC}"
        
        # Install ddclient
        apt-get update
        apt-get install -y ddclient libio-socket-ssl-perl
        
        # Configure ddclient for DynDNS
        cat > /etc/ddclient.conf << EOF
# DynDNS Configuration
daemon=300
syslog=yes
pid=/var/run/ddclient.pid
ssl=yes

protocol=dyndns2
use=web
server=members.dyndns.org
login=$HOSTNAME
password='$DDNS_PASSWORD'
$DOMAIN
EOF
        
        chmod 600 /etc/ddclient.conf
        
        # Start ddclient
        systemctl enable ddclient
        systemctl restart ddclient
        
        echo -e "${GREEN}✓ DynDNS configured with ddclient${NC}"
        ;;
        
    3)
        echo -e "\n${YELLOW}Cloudflare Dynamic DNS Setup${NC}"
        
        # Install ddclient
        apt-get update
        apt-get install -y ddclient libio-socket-ssl-perl
        
        echo ""
        echo "You'll need:"
        echo "  1. Cloudflare API Token (with DNS edit permissions)"
        echo "  2. Zone ID from Cloudflare dashboard"
        echo ""
        
        read -p "Enter Cloudflare API Token: " CF_TOKEN
        read -p "Enter Zone ID: " CF_ZONE_ID
        
        # Configure ddclient for Cloudflare
        cat > /etc/ddclient.conf << EOF
# Cloudflare Configuration
daemon=300
syslog=yes
pid=/var/run/ddclient.pid
ssl=yes

protocol=cloudflare
use=web
server=api.cloudflare.com/client/v4
login=token
password='$CF_TOKEN'
zone=$CF_ZONE_ID
$DOMAIN
EOF
        
        chmod 600 /etc/ddclient.conf
        
        # Start ddclient
        systemctl enable ddclient
        systemctl restart ddclient
        
        echo -e "${GREEN}✓ Cloudflare Dynamic DNS configured${NC}"
        ;;
        
    4)
        echo -e "\n${YELLOW}Manual Configuration${NC}"
        echo ""
        echo "To configure Dynamic DNS manually:"
        echo ""
        echo "1. Install ddclient:"
        echo -e "   ${BLUE}sudo apt-get install ddclient${NC}"
        echo ""
        echo "2. Edit configuration:"
        echo -e "   ${BLUE}sudo nano /etc/ddclient.conf${NC}"
        echo ""
        echo "3. Example configuration:"
        cat << EOF
daemon=300
syslog=yes
ssl=yes
protocol=dyndns2
use=web
server=your-ddns-provider.com
login=$DOMAIN
password='$DDNS_PASSWORD'
$DOMAIN
EOF
        echo ""
        echo "4. Start service:"
        echo -e "   ${BLUE}sudo systemctl enable ddclient${NC}"
        echo -e "   ${BLUE}sudo systemctl start ddclient${NC}"
        ;;
        
    0)
        echo -e "${YELLOW}Skipping Dynamic DNS setup${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}✗ Invalid choice${NC}"
        exit 1
        ;;
esac

# Verify current IP
echo -e "\n${YELLOW}Verifying configuration...${NC}"
CURRENT_IP=$(curl -s https://api.ipify.org)
echo -e "Current public IP: ${BLUE}$CURRENT_IP${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Dynamic DNS Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Domain: $DOMAIN"
echo "Your IP will be automatically updated every 5 minutes"
echo ""
echo "To check status:"
echo -e "  ${BLUE}systemctl status ddclient${NC} (or noip2)"
echo ""
echo "To force update:"
echo -e "  ${BLUE}sudo ddclient -force${NC}"
