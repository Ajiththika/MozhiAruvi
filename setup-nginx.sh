#!/bin/bash

# Mozhi Aruvi Nginx Setup Script
# Run with: sudo bash setup-nginx.sh

# 1. Install Nginx if missing
if ! command -v nginx > /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# 2. Copy configuration
echo "Configuring Nginx for mozhiaruvi.com..."
sudo cp mozhi-nginx.conf /etc/nginx/sites-available/mozhiaruvi
sudo ln -sf /etc/nginx/sites-available/mozhiaruvi /etc/nginx/sites-enabled/

# 3. Test and Reload
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Configuration valid. Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Success! mozhiaruvi.com is now live through Nginx."
else
    echo "❌ Nginx configuration test failed. Please check the logs."
    exit 1
fi

# 4. Success Info
echo ""
echo "--------------------------------------------------------"
echo "Next Steps: Enable SSL (HTTPS) with Certbot"
echo "Run: sudo apt install certbot python3-certbot-nginx -y"
echo "Run: sudo certbot --nginx -d mozhiaruvi.com -d www.mozhiaruvi.com"
echo "--------------------------------------------------------"
