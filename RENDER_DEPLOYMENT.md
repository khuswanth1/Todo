# Render Deployment Guide

## Prerequisites
- A PostgreSQL database (e.g., from Render, Aiven, Railway, or Neon)
- Gmail app password for email service
- Google OAuth credentials (optional, for OAuth login)

## Environment Variables to Set in Render Dashboard

Add these environment variables in the Render Web Service dashboard (Environment tab):

### Database Configuration (Required)
```
DB_URL=jdbc:postgresql://HOST:PORT/DATABASE?sslmode=require
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DRIVER=org.postgresql.Driver
```

**Example (using Render PostgreSQL):**
```
DB_URL=jdbc:postgresql://dpg-xxxxx.render.internal:5432/todo_db?sslmode=require
DB_USERNAME=todo_user
DB_PASSWORD=your_secure_password
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

## Steps to Deploy

1. **Prepare your database:**
   - Create a PostgreSQL database
   - Note the connection details (host, port, database name, username, password)

2. **Push to GitHub:**
   ```bash
   git push origin master
   ```

3. **Connect to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set Name: `todo-backend`
   - Set Root Directory: `/` (or leave empty)
   - Select Runtime: `Docker`
   - Set Plan: Free (or paid tier)

4. **Add Environment Variables:**
   - In the Render dashboard, go to Environment tab
   - Add all required variables from above
   - Click Deploy

5. **Monitor Deployment:**
   - Watch the deployment logs
   - Service should start successfully and bind to port 8080

## Troubleshooting

### "No open ports detected" error
- Check that `PORT` environment variable is not set (or set to 8080)
- Verify `server.port=${PORT:8080}` in application.properties

### "Connection is not available" / Database timeout
- Verify DB_URL is correct and database is accessible
- Check DB_USERNAME and DB_PASSWORD are correct
- Ensure PostgreSQL server is running and accepting connections
- If using Render PostgreSQL, make sure to add `.render.internal` domain

### Application crashes on startup
- Check deployment logs for detailed error messages
- Verify all required environment variables are set
- Ensure database schema exists (app will create tables on first run)

## Local Development

For local development, override environment variables:
```bash
export DB_URL=jdbc:mysql://localhost:3306/todo?...
export DB_USERNAME=root
export DB_PASSWORD=your_local_password
```

Or edit `src/main/resources/application.properties` defaults for local dev.
