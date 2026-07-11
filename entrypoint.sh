#!/bin/sh

echo "=== Starting Container Entrypoint ==="

# Create directories and set permissions
mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql

# MariaDB config - TCP networking enabled
cat > /etc/my.cnf.d/server.cnf <<EOF
[mysqld]
datadir=/var/lib/mysql
socket=/run/mysqld/mysqld.sock
bind-address=0.0.0.0
port=3306
skip-name-resolve
EOF

# Always re-initialize (Render containers are ephemeral anyway)
echo "Initializing MariaDB database..."
rm -rf /var/lib/mysql/*
mysql_install_db --user=mysql --datadir=/var/lib/mysql 2>&1 || mariadb-install-db --user=mysql --datadir=/var/lib/mysql 2>&1
echo "Database initialization complete."

# Start MariaDB with skip-grant-tables on the COMMAND LINE
echo "Starting MariaDB (skip-grant-tables)..."
/usr/bin/mysqld --user=mysql --skip-grant-tables &
MYSQL_PID=$!

# Wait for socket file to appear, then test connection
echo "Waiting for MariaDB..."
CONNECTED=0
for i in $(seq 1 60); do
    if [ -S /run/mysqld/mysqld.sock ]; then
        if mysql -u root -e "SELECT 1" 2>/dev/null; then
            echo "✅ MariaDB ready! (attempt $i)"
            CONNECTED=1
            break
        fi
    fi
    sleep 1
done

if [ "$CONNECTED" -ne 1 ]; then
    echo "❌ MariaDB failed to start."
    cat /var/lib/mysql/*.err 2>/dev/null || true
    ps aux
    exit 1
fi

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS todo;"
echo "✅ Database 'todo' created."

# Now stop MariaDB, remove skip-grant-tables, set password, restart
echo "Stopping MariaDB for auth setup..."
mysqladmin -u root shutdown 2>/dev/null || kill -9 $MYSQL_PID 2>/dev/null || true
sleep 1

# Clean up socket file to avoid stale connection issues
rm -f /run/mysqld/mysqld.sock

# Wait for process to fully exit
for i in $(seq 1 10); do
    if ! ps -p $MYSQL_PID > /dev/null 2>&1; then
        echo "MariaDB stopped."
        break
    fi
    sleep 1
done

# Restart WITHOUT skip-grant-tables
echo "Restarting MariaDB with auth..."
/usr/bin/mysqld --user=mysql &
MYSQL_PID=$!

# Wait for restart
for i in $(seq 1 30); do
    if [ -S /run/mysqld/mysqld.sock ]; then
        # On fresh Alpine MariaDB, root has no password and uses unix_socket
        # We connect via socket as the mysql system user won't work,
        # but root without password should work on fresh init
        if mysql -u root -e "SELECT 1" 2>/dev/null; then
            break
        fi
    fi
    sleep 1
done

# Set root password using MariaDB-compatible syntax
mysql -u root -e "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('2205');" 2>/dev/null || true
mysql -u root -p2205 -e "GRANT ALL ON *.* TO 'root'@'127.0.0.1' IDENTIFIED BY '2205'; FLUSH PRIVILEGES;" 2>/dev/null || true
echo "✅ Auth configured."

# Verify
if mysql -u root -p2205 -h 127.0.0.1 -P 3306 -e "SELECT 1" 2>/dev/null; then
    echo "✅ TCP connection with password verified!"
else
    echo "⚠️ TCP verify failed - trying without password..."
fi

# Start Spring Boot
echo "=== Starting Spring Boot Application ==="
export DB_URL="jdbc:mariadb://127.0.0.1:3306/todo?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="2205"
export DB_DRIVER="org.mariadb.jdbc.Driver"
export PORT="${PORT:-8080}"

echo "Database URL: $DB_URL"
echo "Server Port: $PORT"
echo "Starting application..."

exec java -jar app.jar
