#!/bin/bash

# Deployment Script for IoT Barbecue System

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "Installing Node.js and npm..."
sudo apt install -y nodejs npm

# Install SQLite
echo "Installing SQLite..."
sudo apt install -y sqlite3

# Navigate to backend directory cd /home/<username>/iot-barbecue-system/backend || exit
cd /home/stinky/barbecue-system/backend || exit

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Start backend server (run in the background)
echo "Starting backend server..."
nohup node app.js > backend.log 2>&1 &

echo "Deployment completed successfully!"
