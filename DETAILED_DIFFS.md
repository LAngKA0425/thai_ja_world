# Runtime Connection Fixes - Detailed Diffs

## File: docker-compose.dev.yml

### Change 1: Frontend environment variables (line 47)
```diff
  frontend:
    ...
    environment:
      - NODE_ENV=development
-     - NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
+     - NEXT_PUBLIC_SOCKET_URL=http://socket-server:3001
      - NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Change 2: Frontend dependencies (line 49-53)
```diff
  frontend:
    ...
    depends_on:
      backend:
        condition: service_healthy
+     socket-server:
+       condition: service_healthy
    healthcheck:
```

### Change 3: Frontend healthcheck (line 54-59)
```diff
  frontend:
    ...
+   healthcheck:
+     test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
+     interval: 10s
+     timeout: 5s
+     retries: 3
+     start_period: 15s
    restart: unless-stopped
```

### Change 4: Backend healthcheck (line 78-84)
```diff
  backend:
    ...
    healthcheck:
-     test: ["CMD-SHELL", "python -c \"import urllib.request, sys; r=urllib.request.urlopen('http://localhost:8000/api/v1/health'); sys.exit(0) if r.status == 200 else sys.exit(1)\""]
+     test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    restart: unless-stopped
```

### Change 5: Socket-server healthcheck (line 104-109)
```diff
  socket-server:
    ...
+   healthcheck:
+     test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 404) process.exit(0); process.exit(1);})"]
+     interval: 10s
+     timeout: 5s
+     retries: 3
+     start_period: 15s
    restart: unless-stopped
```

---

## Summary of Changes

| Component | Issue | Fix |
|-----------|-------|-----|
| Backend Healthcheck | Python urllib fragile | Use curl |
| Frontend Socket URL | localhost wrong in Docker | Use service name: socket-server |
| Frontend Dependencies | No socket-server wait | Add socket-server depends_on |
| Frontend Healthcheck | No health monitoring | Add wget-based healthcheck |
| Socket-Server Healthcheck | No health checks | Add Node.js-based healthcheck |

All changes ensure:
- ✅ Correct Docker networking
- ✅ Proper service startup sequence
- ✅ Health monitoring and auto-recovery
- ✅ No breaking changes to business logic
