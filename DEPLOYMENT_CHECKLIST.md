# 🚀 Mozhi Aruvi Production Deployment Checklist

Follow these steps to ensure a stable, error-free deployment on your AWS server.

## 1. ⚙️ Environment Variables Check

### Backend (`Backend/.env`)
Ensure these values are set for production:
- `NODE_ENV=production`
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none` (for cross-domain) or `lax` (for same-domain)
- `FRONTEND_ORIGIN=https://mozhiaruvi.com,https://www.mozhiaruvi.com` (remove localhost in final prod)
- `PRIMARY_SITE_URL=https://mozhiaruvi.com`
- `BACKEND_URL=http://127.0.0.1:5000` (internal proxy URL)

### Frontend (`Frontend/.env.local` or Environment Config)
- `NEXT_PUBLIC_API_URL=/api` (uses Nginx/Next.js proxy)
- `BACKEND_URL=http://127.0.0.1:5000` (for Server-Side Rendering)

---

## 2. 🛠️ Build Process

Run these commands from the **Frontend** directory:
```bash
# 1. Clean old builds
rm -rf .next

# 2. Install dependencies
npm install

# 3. Build for production
# This embeds NEXT_PUBLIC variables into the static chunks
npm run build
```

---

## 3. 🔄 Process Management (PM2)

Restart both services to pick up NEW environment variables and builds:

```bash
# 1. Restart Backend
cd Backend
pm2 restart all --update-env 
# OR specifically:
pm2 restart mozhi-backend --update-env

# 2. Restart Frontend
cd Frontend
pm2 restart mozhi-frontend --update-env
```

**Note:** Always use `--update-env` when you change your `.env` files.

---

## 🌐 4. Nginx Validation

Check if Nginx is running correctly:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 5. Verification Steps

1. **Login Flow**: Open `https://mozhiaruvi.com/auth/login`. Verify you can log in.
2. **Google OAuth**: Test social login. It should redirect back to the HTTPS domain, NOT localhost.
3. **Image Upload**: Go to Admin -> Lessons. Try uploading an image. Open browser console (F12) to check for CORS errors.
4. **Energy System**: Check if student energy recovers correctly (requires `NODE_ENV=production` for proper cookie logic).
5. **Subscription**: Click the Subscription button in the student sidebar. It should show the plans.

---

## ⚠️ Troubleshooting

- **403 Forbidden (CSRF)**: Ensure the `Origin` header in your browser matches one of the values in `FRONTEND_ORIGIN`.
- **401 Unauthorized (Refresh)**: Check if cookies are being blocked by the browser. They MUST be `Secure` on HTTPS.
- **502 Bad Gateway**: Usually means the Backend (port 5000) or Frontend (port 3000) is not running in PM2.
