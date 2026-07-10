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
skip-grant-tables
EOF

# Always re-initialize (Render containers are ephemeral)
echo "Initializing MariaDB database..."
rm -rf /var/lib/mysql/*
mysql_install_db --user=mysql --datadir=/var/lib/mysql 2>&1
echo "Database initialization complete."

# Start MariaDB directly with skip-grant-tables for initial setup
echo "Starting MariaDB server..."
/usr/bin/mysqld --user=mysql &
MYSQL_PID=$!

# Wait for MariaDB to accept connections
echo "Waiting for MariaDB to accept connections..."
CONNECTED=0
for i in $(seq 1 60); do
    if echo "SELECT 1;" | mysql --socket=/run/mysqld/mysqld.sock 2>/dev/null; then
        echo "✅ MariaDB is accepting connections! (attempt $i)"
        CONNECTED=1
        break
    fi
    echo "  Attempt $i/60 - waiting..."
    sleep 1
done

if [ "$CONNECTED" -ne 1 ]; then
    echo "❌ MariaDB failed to start after 60 seconds."
    cat /var/lib/mysql/*.err 2>/dev/null || echo "(no error log found)"
    exit 1
fi

# Create database and set up root user with password
echo "Setting up database and users..."
mysql --socket=/run/mysqld/mysqld.sock <<EOSQL
CREATE DATABASE IF NOT EXISTS todo;
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '2205';
FLUSH PRIVILEGES;
EOSQL
echo "✅ Database 'todo' is ready."

# Restart MariaDB WITHOUT skip-grant-tables
echo "Restarting MariaDB with authentication enabled..."
kill $MYSQL_PID
wait $MYSQL_PID 2>/dev/null || true

# Remove skip-grant-tables from config
cat > /etc/my.cnf.d/server.cnf <<EOF
[mysqld]
datadir=/var/lib/mysql
socket=/run/mysqld/mysqld.sock
bind-address=0.0.0.0
port=3306
skip-name-resolve
EOF

/usr/bin/mysqld --user=mysql &

# Wait for restart
echo "Waiting for MariaDB restart..."
for i in $(seq 1 30); do
    if mysqladmin --socket=/run/mysqld/mysqld.sock -u root -p2205 ping 2>/dev/null | grep -q "alive"; then
        echo "✅ MariaDB restarted with auth enabled!"
        break
    fi
    sleep 1
done

# Start the Spring Boot application
echo "=== Starting Spring Boot Application ==="
export DB_URL="jdbc:mariadb://127.0.0.1:3306/todo?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="2205"
export DB_DRIVER="org.mariadb.jdbc.Driver"
exec java -jar app.jar
