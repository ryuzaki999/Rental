#!/usr/bin/env bash
set -euo pipefail

# Simple provisioning script to run on Ubuntu EC2 after SSH
# Usage: sudo bash provision.sh <GIT_REPO_URL> [BRANCH]

GIT_REPO_URL=${1:-}
BRANCH=${2:-main}

if [ -z "$GIT_REPO_URL" ]; then
  echo "Usage: sudo bash provision.sh <GIT_REPO_URL> [BRANCH]"
  exit 1
fi

apt update && apt upgrade -y
apt install -y git curl build-essential

# Node 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

npm install -g pm2

# prepare app folder
APP_DIR=/home/ubuntu/app
mkdir -p "$APP_DIR"
chown -R ubuntu:ubuntu "$APP_DIR"

su - ubuntu -c "git clone --depth 1 --branch $BRANCH $GIT_REPO_URL $APP_DIR || (cd $APP_DIR && git pull)"

# backend
su - ubuntu -c "cd $APP_DIR/server && npm install"

# frontend
su - ubuntu -c "cd $APP_DIR/client && npm install && npm run build"

# start backend (adjust path if your entry is different)
pm2 start /home/ubuntu/app/server/src/app.js --name rental-server --watch || true

# serve frontend build
pm2 serve /home/ubuntu/app/client/dist 8080 --name rental-client --spa || true

pm2 save

echo "Provisioning complete. Use 'pm2 ls' to check processes."
