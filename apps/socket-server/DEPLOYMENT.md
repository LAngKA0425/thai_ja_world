# Socket Server Deployment Guide

Complete guide for deploying the Taeja World Socket.io server to production.

## Pre-Deployment Checklist

- [ ] All code committed and tested
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] TypeScript builds without errors
- [ ] All tests passing
- [ ] Security review completed
- [ ] Load testing passed
- [ ] Documentation updated

## Environment Setup

### Production Environment Variables

Create a `.env` file in the production environment:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (Update for your domain)
CORS_ORIGIN=https://youromain.com

# JWT Secret (Generate a strong, random secret)
JWT_SECRET=your-long-random-secret-key-min-32-chars

# Optional: Additional monitoring
LOG_LEVEL=info
```

### Generating a Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using pwgen
pwgen -s 32 1
```

### CORS Configuration

Update `CORS_ORIGIN` for your deployment:

```env
# Development
CORS_ORIGIN=http://localhost:3000

# Staging
CORS_ORIGIN=https://staging.yourdomain.com

# Production
CORS_ORIGIN=https://yourdomain.com
```

## Building for Production

### 1. Install Dependencies

```bash
npm install --production
```

Or to keep dev dependencies:

```bash
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

This creates the `/dist` directory with compiled JavaScript.

### 3. Verify Build

```bash
ls -la dist/
# Should contain:
# - index.js
# - config.js
# - middleware/
# - services/
# - handlers/
# - types/
# - etc.
```

## Deployment Options

### Option 1: PM2 (Recommended for VPS/Dedicated Server)

#### Install PM2

```bash
npm install -g pm2
```

#### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'taeja-socket-server',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        CORS_ORIGIN: 'https://yourdomain.com',
        JWT_SECRET: 'your-secret-here',
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
```

#### Deploy with PM2

```bash
# Build
npm run build

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-startup
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs taeja-socket-server

# Restart
pm2 restart taeja-socket-server

# Stop
pm2 stop taeja-socket-server

# Delete
pm2 delete taeja-socket-server
```

### Option 2: Docker

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 404) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]
```

#### Create .dockerignore

```
node_modules
dist
.git
.env
.env.*
logs
coverage
*.log
.DS_Store
```

#### Build Docker Image

```bash
docker build -t taeja-socket-server:latest .
```

#### Run Docker Container

```bash
docker run \
  -d \
  --name taeja-socket-server \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e CORS_ORIGIN=https://yourdomain.com \
  -e JWT_SECRET=your-secret-here \
  --restart unless-stopped \
  taeja-socket-server:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  socket-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      CORS_ORIGIN: https://yourdomain.com
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 404) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 3s
      retries: 3
    volumes:
      - ./logs:/app/logs
    networks:
      - taeja-network

networks:
  taeja-network:
    driver: bridge
```

Deploy with:

```bash
docker-compose up -d
```

### Option 3: Systemd Service (Linux VPS)

#### Create Systemd Service File

Create `/etc/systemd/system/taeja-socket-server.service`:

```ini
[Unit]
Description=Taeja World Socket Server
After=network.target

[Service]
Type=simple
User=taeja
WorkingDirectory=/opt/taeja/socket-server
EnvironmentFile=/opt/taeja/socket-server/.env
ExecStart=/usr/bin/node /opt/taeja/socket-server/dist/index.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/taeja-socket-server/out.log
StandardError=append:/var/log/taeja-socket-server/error.log

[Install]
WantedBy=multi-user.target
```

#### Setup Systemd Service

```bash
# Create log directory
sudo mkdir -p /var/log/taeja-socket-server
sudo chown taeja:taeja /var/log/taeja-socket-server

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable taeja-socket-server

# Start service
sudo systemctl start taeja-socket-server

# Check status
sudo systemctl status taeja-socket-server

# View logs
sudo journalctl -u taeja-socket-server -f
```

## Reverse Proxy Setup

### Nginx Configuration

```nginx
upstream socket_server {
    server localhost:3001;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://socket_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName yourdomain.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/ upgrade=websocket connectiontimeout=3600 timeout=3600
    ProxyPassReverse / http://localhost:3001/

    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
```

## SSL/TLS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal (check it's enabled)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring & Logging

### Application Logging

The server logs to console. Set up centralized logging:

```bash
# With PM2
pm2 logs taeja-socket-server

# With Docker
docker logs taeja-socket-server -f

# With Systemd
journalctl -u taeja-socket-server -f
```

### Health Checks

Implement health check endpoint:

```typescript
// Add to src/index.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

Monitor with:

```bash
curl https://yourdomain.com/health
```

### Metrics Monitoring

Use PM2 Plus for monitoring:

```bash
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
pm2 link YOUR_SECRET_KEY
```

Or use external services:
- **Datadog**: Cloud monitoring
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay and logging

### Process Monitoring

```bash
# Monitor with PM2
pm2 monit

# Check memory usage
ps aux | grep "node dist/index.js"

# Monitor with top
top -p $(pgrep -f "node dist/index.js")
```

## Database Persistence (Optional)

For production, consider adding persistence:

### Redis (Session & Message Storage)

```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
```

Update `package.json`:

```json
{
  "dependencies": {
    "redis": "^4.6.0",
    "@socket.io/redis-adapter": "^8.1.0"
  }
}
```

Configure in `src/index.ts`:

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

### PostgreSQL (User/Message History)

Setup PostgreSQL database for long-term storage:

```sql
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  message TEXT,
  type VARCHAR(20),
  sent_at TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  message TEXT,
  timestamp TIMESTAMP,
  plaza_id VARCHAR(255)
);
```

## Backup Strategy

### Application Backup

```bash
# Backup configuration
tar -czf backup-$(date +%Y%m%d).tar.gz .env ecosystem.config.js

# Backup logs
tar -czf logs-$(date +%Y%m%d).tar.gz logs/

# Automated daily backup
0 2 * * * tar -czf /backups/socket-server-$(date +\%Y\%m\%d).tar.gz /opt/taeja/socket-server
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump yourdatabase > backup-$(date +%Y%m%d).sql

# Redis backup
redis-cli BGSAVE
```

## Performance Tuning

### Node.js Optimization

```bash
# Increase file descriptors
ulimit -n 65536

# Set in /etc/security/limits.conf
taeja soft nofile 65536
taeja hard nofile 65536
```

### System Kernel Tuning

```bash
# Increase socket backlog
sysctl -w net.core.somaxconn=4096

# Increase connection tracking
sysctl -w net.netfilter.nf_conntrack_max=262144
```

## Security Hardening

### Environment Security

```bash
# Secure .env file
chmod 600 .env

# Run as unprivileged user
useradd -m -s /bin/false taeja
chown -R taeja:taeja /opt/taeja/socket-server
```

### Rate Limiting

Add rate limiting middleware:

```typescript
const rateLimit = require('express-rate-limit');

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));
```

### HTTPS/WSS Only

```typescript
// Require secure connections in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Troubleshooting

### Connection Issues

```bash
# Check if server is running
netstat -tlnp | grep 3001

# Test connection
telnet localhost 3001

# Check firewall
sudo iptables -L | grep 3001
```

### Memory Leaks

```bash
# Monitor memory growth
pm2 monit

# Restart if memory exceeds threshold
pm2 install pm2-auto-pull
pm2 set pm2-auto-pull max_memory 500
```

### Performance Issues

1. Check CPU usage: `top -p $(pgrep -f "node")`
2. Monitor network: `iftop`
3. Check logs: `pm2 logs taeja-socket-server`
4. Analyze connections: `netstat -an | grep ESTABLISHED | wc -l`

## Rollback Procedure

```bash
# With PM2
pm2 save
git revert HEAD
npm run build
pm2 restart taeja-socket-server

# With Docker
docker stop taeja-socket-server
docker run ... taeja-socket-server:previous-version
```

## Testing Production Deployment

```bash
# Test connection
curl https://yourdomain.com/health

# Test WebSocket with client
npm install socket.io-client
node example-client.ts

# Load test
npm install -g artillery
artillery quick --count 10 --num 100 https://yourdomain.com
```

## Maintenance Schedule

- **Daily**: Monitor logs and metrics
- **Weekly**: Review server performance and uptime
- **Monthly**: Update dependencies, patch security issues
- **Quarterly**: Full backup and disaster recovery test
- **Annually**: Security audit and infrastructure review

## Support & Monitoring

### Alerting

Set up alerts for:
- Server down/not responding
- Memory usage > 80%
- CPU usage > 90%
- Error rate spike
- Connection drop-off

### Documentation

Keep updated:
- Architecture diagrams
- Deployment procedures
- Environment configurations
- Emergency contacts
- Runbooks for common issues
