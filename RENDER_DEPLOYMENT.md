# Render Deployment Guide - MySQL

## ⚡ Quick Start (10 minutes)

1. **Get free MySQL database** (TiDB Cloud or Aiven)
2. **Set 4 environment variables on Render Dashboard**
3. **Deploy and wait 3-5 minutes**
4. ✅ Done!

---

## Prerequisites

- **MySQL Database** (free options):
  - [TiDB Cloud](https://tidbcloud.com/free-tier) - Easiest, MySQL 8.0 compatible
  - [Aiven](https://aiven.io/) - Free tier available
  - [PlanetScale](https://planetscale.com/) - MySQL compatible
- Gmail account with app password for email
- GitHub repository connected to Render

---

## Step 1: Create Free MySQL Database

### Option A: TiDB Cloud (Recommended - Easiest)

1. Go to https://tidbcloud.com/free-tier
2. Sign up (free tier available)
3. Create a cluster (free):
   - Region: Any
   - Database: `todo`
4. Go to **Cluster** → **Connection**
5. Copy the connection details:
   - **Host:** (looks like `gateway01.xxx.prod.cluster.tidbcloud.com`)
   - **Username:** `root`
   - **Password:** (set during creation)

### Option B: Aiven (Alternative)

1. Go to https://aiven.io/
2. Sign up → Create free MySQL service
3. Copy connection details from dashboard

---

## Step 2: Update Code and Push to GitHub

```bash
git add .
git commit -m "Fix Render deployment: use MySQL8Dialect"
git push origin master
```

---

## Step 3: Deploy on Render

### 3a. Create Web Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository (`khuswanth1/Todo`)
4. Configuration:
   - **Name:** `todo-backend`
   - **Branch:** `master`
   - **Root Directory:** (leave empty)
   - **Runtime:** `Docker`
   - **Plan:** Free
5. **DO NOT click Deploy Yet!**

### 3b. Set Environment Variables (CRITICAL!)

1. Click **"Environment"** tab on the left
2. Add these 4 variables:

| Key | Value | Example |
|-----|-------|---------|
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://gateway01.xxx.prod.cluster.tidbcloud.com:4000/todo?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `YourPassword123!` |
| `DB_DRIVER` | MySQL driver | `com.mysql.cj.jdbc.Driver` |

**Important:** Use `?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true` for MySQL!

3. Click **"Save Changes"**
4. Click **"Deploy"** button

### 3c: Monitor Deployment
- Watch the logs
- Should see: ✅ "Your service is live" (3-5 minutes)

---

## Step 4: Add Email Configuration (Optional)

To enable email notifications, add to Environment tab:

```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**How to get Gmail app password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail + Windows Computer
3. Copy the generated 16-char password
4. Use it as `MAIL_PASSWORD`

---

## Step 5: Add Google OAuth (Optional)

To enable Google login, add to Environment tab:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_FONTS_API_KEY=your-api-key
```

---

## Troubleshooting

### ❌ "Connection is not available" / "Connection timed out"

**Cause:** Wrong database URL or credentials

**Solution:**
1. Check your MySQL provider's connection details
2. Verify URL format matches:
   ```
   jdbc:mysql://HOST:PORT/DATABASE?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
   ```
3. Test connection locally:
   ```bash
   mysql -h your-host -P 4000 -u root -p
   ```
4. Update environment variables on Render with correct values

### ❌ "Unable to determine Dialect without JDBC metadata"

**Cause:** Database connection failed or driver issue

**Solution:**
- Verify `DB_DRIVER=com.mysql.cj.jdbc.Driver` (exact value)
- Check all 4 environment variables are set
- Redeploy: Click "Deploy" button again

### ❌ "Exited with status 1" / "No open ports detected"

**Cause:** Application crashed during startup

**Solution:**
1. View deployment logs
2. Look for database connection errors
3. Check:
   - Is database URL correct?
   - Are username/password correct?
   - Is database accepting connections?
4. Fix variables and redeploy

### ❌ SSL/TLS Connection Error

**Solution:**
- Ensure URL includes `?useSSL=true`
- Some providers need `&sslMode=REQUIRED` instead
- Try: `jdbc:mysql://HOST:PORT/DB?useSSL=true&allowPublicKeyRetrieval=true`

---

## Local Development

For local MySQL on your computer:

1. Install MySQL locally
2. Create database:
   ```sql
   CREATE DATABASE todo;
   ```
3. Set environment variables:
   ```bash
   export DB_URL=jdbc:mysql://localhost:3306/todo?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   export DB_USERNAME=root
   export DB_PASSWORD=your_local_password
   ```
4. Run app locally:
   ```bash
   mvn spring-boot:run
   ```

Or keep defaults in `application.properties` for local dev.

---

## Database URL Examples

**TiDB Cloud:**
```
jdbc:mysql://gateway01.us-east-1.prod.cluster.tidbcloud.com:4000/todo?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

**PlanetScale:**
```
jdbc:mysql://aws.connect.psdb.cloud:3306/todo?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

**Local MySQL:**
```
jdbc:mysql://localhost:3306/todo?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

## Testing After Deployment

1. Visit your app: `https://your-service-name.onrender.com`
2. Check if it loads (may take 30 seconds on first request)
3. Try creating an account or logging in
4. Check browser console for errors (F12)

If still having issues, check deployment logs on Render dashboard.
