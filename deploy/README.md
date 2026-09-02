# Deployment helpers

This folder contains scripts and config you can use to provision an Ubuntu EC2 instance and run the project with `pm2`.

Files:
- `cloud-init.yaml` - cloud-init user-data to paste into EC2 instance launch. Replace `<GIT_REPO_URL>` and `<BRANCH>` before creating the instance.
- `provision.sh` - run on the server (as root) to install Node, Git, PM2, clone repo and start processes. Usage: `sudo bash provision.sh <GIT_REPO_URL> [BRANCH]`
- `pm2-ecosystem.config.js` - example pm2 ecosystem file (edit paths if needed).

Quick manual steps (if not using cloud-init):

1. SSH into server:

```bash
chmod 400 /path/to/key.pem
ssh -i /path/to/key.pem ubuntu@PUBLIC_IP
```

2. Copy script and run:

```bash
# upload this repo or clone directly on server
sudo bash provision.sh https://github.com/<YOUR_USER>/<YOUR_REPO>.git main
```

3. Check pm2:

```bash
pm2 ls
node -v
pm2 -v
```

4. Open `http://PUBLIC_IP:8080` in browser to access frontend. If the frontend requires API requests to `http://localhost:8081`, ensure port `8081` is allowed in the security group or configure a reverse proxy.

Screenshot suggestions to capture for verification:
- SSH terminal logged in (show `hostnamectl` or prompt)
- `node -v` and `pm2 -v` outputs
- `pm2 ls` showing `rental-server` and `rental-client`
- Browser screenshot of the app at `http://PUBLIC_IP:8080` and signup/login flow

If you want, I can generate an Nginx reverse-proxy + Certbot script next to serve frontend on port 80 and proxy API to 8081 with TLS.
