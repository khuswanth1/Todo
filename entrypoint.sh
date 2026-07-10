#!/bin/sh
set -e

echo "=== Starting Container Entrypoint ==="

# Create directories and set permissions
mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql

# Create a proper MariaDB config that enables TCP networking
cat > /etc/my.cnf.d/server.cnf <<EOF
[mysqld]
datadir=/var/lib/mysql
socket=/run/mysqld/mysqld.sock
bind-address=0.0.0.0
port=3306
skip-name-resolve
EOF

# Initialize MariaDB database if not initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB database..."
    mysql_install_db --user=mysql --datadir=/var/lib/mysql 2>&1
    echo "Database initialization complete."
fi

# Start MariaDB directly (not via mysqld_safe)
echo "Starting MariaDB server..."
/usr/bin/mysqld --user=mysql &
MYSQL_PID=$!

# Wait for MariaDB to accept connections
echo "Waiting for MariaDB to accept connections..."
CONNECTED=0
for i in $(seq 1 60); do
    if mysqladmin --socket=/run/mysqld/mysqld.sock ping 2>/dev/null | grep -q "alive"; then
        echo "✅ MariaDB is accepting connections! (attempt $i)"
        CONNECTED=1
        break
    fi
    echo "  Attempt $i/60 - waiting..."
    sleep 1
done

if [ "$CONNECTED" -ne 1 ]; then
    echo "❌ MariaDB failed to start after 60 seconds."
    echo "=== MariaDB Error Log ==="
    cat /var/lib/mysql/*.err 2>/dev/null || echo "(no error log found)"
    echo "=== Process Status ==="
    ps aux
    echo "========================="
    exit 1
fi

# Create database and set up access
echo "Setting up database..."
mysql --socket=/run/mysqld/mysqld.sock -u root -e "CREATE DATABASE IF NOT EXISTS todo;" 2>&1
mysql --socket=/run/mysqld/mysqld.sock -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY '2205'; FLUSH PRIVILEGES;" 2>&1
mysql --socket=/run/mysqld/mysqld.sock -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' IDENTIFIED BY '2205'; FLUSH PRIVILEGES;" 2>&1
echo "✅ Database 'todo' is ready."

# Verify TCP connectivity
echo "Verifying TCP connection on port 3306..."
if mysqladmin -h 127.0.0.1 -P 3306 -u root -p2205 ping 2>/dev/null | grep -q "alive"; then
    echo "✅ TCP connection verified!"
else
    echo "⚠️ TCP ping failed, trying socket connection test..."
    mysql --socket=/run/mysqld/mysqld.sock -u root -p2205 -e "SELECT 1;" 2>&1
fi

# Start the Spring Boot application
echo "=== Starting Spring Boot Application ==="
export DB_URL="jdbc:mariadb://127.0.0.1:3306/todo?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="2205"
export DB_DRIVER="org.mariadb.jdbc.Driver"
exec java -jar app.jar
