#!/bin/sh

echo "=== Starting Container Entrypoint ==="

# Create directories and set permissions
mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld /var/lib/mysql

# Initialize MariaDB database if not initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB database..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql --verbose
    if [ $? -ne 0 ]; then
        echo "❌ mariadb-install-db failed!"
    fi
fi

# Start MariaDB in background with explicit TCP binding
echo "Starting MariaDB in background..."
/usr/bin/mysqld_safe --datadir=/var/lib/mysql --user=mysql --bind-address=127.0.0.1 --port=3306 --skip-networking=0 --skip-syslog &

# Wait for MariaDB to start up
echo "Waiting for MariaDB to start..."
CONNECTED=0
for i in $(seq 1 30); do
    if mysqladmin ping --silent; then
        echo "✅ MariaDB is pingable!"
        CONNECTED=1
        break
    fi
    sleep 1
done

if [ $CONNECTED -ne 1 ]; then
    echo "❌ MariaDB failed to start after 30 seconds."
    echo "=== Dumping MariaDB Error Log ==="
    cat /var/lib/mysql/*.err
    echo "================================="
fi

echo "Creating database 'todo' and setting password..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS todo;"
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '2205'; FLUSH PRIVILEGES;"

# Start the Spring Boot application
echo "Starting Spring Boot application..."
exec java -jar app.jar
