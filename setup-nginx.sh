#!/bin/bash

# Mozhi Aruvi Nginx & SSL Setup Script
# Run with: sudo bash setup-nginx.sh

# 1. Install Nginx if missing
if ! command -v nginx > /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# 2. Install Certbot (Let's Encrypt Client)
if ! command -v certbot > /dev/null; then
    echo "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

# 3. Copy configuration
echo "Configuring Nginx for mozhiaruvi.com..."
sudo cp mozhi-nginx.conf /etc/nginx/sites-available/mozhiaruvi
sudo ln -sf /etc/nginx/sites-available/mozhiaruvi /etc/nginx/sites-enabled/

# 4. Request SSL Certificate (Automatic)
# Note: This requires the domain to point to this server's public IP.
echo "Checking for SSL Certificate..."
if [ ! -d "/etc/letsencrypt/live/mozhiaruvi.com" ]; then
    echo "Requesting new SSL certificate..."
    # We use --nginx plugin to automatically handle the challenge and configuration
    sudo certbot --nginx -d mozhiaruvi.com -d www.mozhiaruvi.com --non-interactive --agree-tos --register-unsafely-without-email
else
    echo "✅ SSL certificate already exists."
fi

# 5. Test and Reload
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Configuration valid. Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Success! Mozhi Aruvi is now secure with HTTPS."
else
    echo "❌ Nginx configuration test failed. Please check the logs."
    exit 1
fi

# 6. Set up Auto-Renewal
echo "Ensuring auto-renewal is active..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "--------------------------------------------------------"
echo "URL: https://mozhiaruvi.com"
echo "SSL Provider: Let's Encrypt (Open Source)"
echo "--------------------------------------------------------"
