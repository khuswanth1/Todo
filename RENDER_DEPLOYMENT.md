# Render Deployment Guide

## ⚡ Quick Start (5 minutes)

1. **Create a PostgreSQL database** (Render free tier recommended)
2. **Go to Render dashboard** → Your service → Environment tab
3. **Add 4 environment variables:**
   ```
   DB_URL=jdbc:postgresql://your-host:5432/your-db?sslmode=require
   DB_USERNAME=your_user
   DB_PASSWORD=your_pass
   DB_DRIVER=org.postgresql.Driver
   ```
4. **Click "Deploy"** and wait 3-5 minutes
5. ✅ Your app should start successfully!

---

## Prerequisites
- A PostgreSQL database (e.g., from Render, Aiven, Railway, or Neon)
- Gmail app password for email service
- Google OAuth credentials (optional, for OAuth login)

## ⚠️ CRITICAL: Set Environment Variables FIRST

**The deployment will fail if these environment variables are not set!**

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your "todo-backend" service
3. Click the **"Environment"** tab on the left sidebar

### Step 2: Add Database Configuration (Required)
You MUST create a PostgreSQL database first:
- Use Render PostgreSQL, Neon, Railway, or Supabase (free tier available)
- Get your connection details

Then add these exact environment variables:

| Key | Value | Example |
|-----|-------|---------|
| `DB_URL` | PostgreSQL JDBC URL with `?sslmode=require` | `jdbc:postgresql://dpg-xxxxx.render.internal:5432/todo_db?sslmode=require` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your_secure_password_here` |
| `DB_DRIVER` | PostgreSQL driver (exact) | `org.postgresql.Driver` |

**DO NOT include `jdbc:mysql://` - you MUST use PostgreSQL!**

Example values:
```
DB_URL=jdbc:postgresql://dpg-xxxxx.render.internal:5432/todo_db?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=MySecurePassword123!
DB_DRIVER=org.postgresql.Driver
```

### Email Configuration (Required for email features)
```
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

**Note:** Use a Gmail App Password, not your regular password:
1. Go to https://myaccount.google.com/apppasswords
2. Generate an app password for Mail
3. Use the generated password as MAIL_PASSWORD

### Google OAuth (Optional)
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_FONTS_API_KEY=your_api_key
```

## Step-by-Step Deployment

### Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** in top right → Select **"PostgreSQL"**
3. Fill in the form:
   - **Name:** `todo-db` (or any name)
   - **Database:** `todo` (or any name)
   - **User:** `postgres` (default)
   - **Region:** Same as your web service (important!)
   - **Plan:** Free (if available)
4. Click **"Create Database"**
5. Wait for it to initialize (2-3 minutes)
6. **Copy the connection details:**
   - Internal Database URL (the one with `.render.internal`)
   - Username
   - Password

### Step 2: Update GitHub with Latest Code

```bash
git add .
git commit -m "Fix Render deployment: add PostgreSQL dialect and env var support"
git push origin master
```

### Step 3: Deploy Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (`khuswanth1/Todo`)
4. Fill in the form:
   - **Name:** `todo-backend`
   - **Branch:** `master`
   - **Root Directory:** (leave empty)
   - **Runtime:** `Docker`
   - **Plan:** Free
5. Click **"Create Web Service"**
6. **Don't start deploying yet!**

### Step 4: Add Environment Variables (CRITICAL!)

1. In your new web service dashboard, click **"Environment"** tab
2. Click **"Add Environment Variable"** and add these 4:

| Key | Value |
|-----|-------|
| `DB_URL` | `jdbc:postgresql://dpg-xxxxx.render.internal:5432/todo?sslmode=require` ← **USE .render.internal** |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | *(Copy from PostgreSQL service details)* |
| `DB_DRIVER` | `org.postgresql.Driver` |

3. Click **"Save Changes"**
4. Click **"Deploy"** button

### Step 5: Monitor Deployment

1. Watch the "Deploy" log panel
2. You should see:
   - ✅ Build successful
   - ✅ Application running on port 8080
   - ✅ Hibernate initializing tables
3. Wait for **"Your service is live"** message (3-5 minutes)

### Step 6: Test Your App

Visit: `https://your-service-name.onrender.com`

If deployment fails, jump to Troubleshooting section below.

## Troubleshooting

### ❌ "Unable to determine Dialect without JDBC metadata"
**Cause:** Environment variables are NOT set or incorrect database connection details

**Solution:**
1. Go to Render Dashboard → Environment tab
2. Add ALL 4 database environment variables:
   - `DB_URL` (with `?sslmode=require`)
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_DRIVER` = `org.postgresql.Driver`
3. Click "Deploy" to redeploy
4. Wait 2-3 minutes for deployment to complete

### ❌ "Connection is not available" / Database timeout
**Cause:** Database credentials are wrong or database isn't reachable

**Solution:**
- Test connection locally first:
  ```bash
  psql -h your-host -U your-username -d your-database
  ```
- Verify exact values from your database provider (Render, Neon, etc.)
- Check that PostgreSQL URL includes `?sslmode=require`
- If using Render PostgreSQL, MUST use `.render.internal` hostname (not `.onrender.com`)

### ❌ "Exited with status 1"
**Cause:** Application crashed before binding to port (usually database connection issue)

**Solution:**
1. Check deployment logs for the actual error
2. Look for "HikariPool", "SQLException", or "Unable to open JDBC Connection"
3. This indicates database configuration is wrong
4. Re-check environment variables match your database exactly

### ❌ "No open ports detected"
**Cause:** App crashed before binding to port 8080

**Solution:**
- Read the full error log above this message
- Usually indicates database connection failure
- Follow the "Connection is not available" troubleshooting above

## Local Development

For local development, override environment variables:
```bash
export DB_URL=jdbc:mysql://localhost:3306/todo?...
export DB_USERNAME=root
export DB_PASSWORD=your_local_password
```

Or edit `src/main/resources/application.properties` defaults for local dev.
