#!/bin/bash

# CloudPanel Setup Script
# Run this on your CloudPanel server

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Clone repository (replace with your repo URL)
cd /home/$USER/htdocs/$DOMAIN
git clone https://github.com/YOUR_USERNAME/rangaone-fe.git .

# Set up environment
cp .env.production.example .env.production
# Edit .env.production with your values

# Initial deployment
docker-compose up -d --build

echo "Setup complete! Configure your GitHub secrets:"
echo "CLOUDPANEL_HOST: Your server IP"
echo "CLOUDPANEL_USER: Your username"
echo "CLOUDPANEL_SSH_KEY: Your private SSH key"
echo "CLOUDPANEL_DOMAIN: Your domain folder name"