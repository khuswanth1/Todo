#!/bin/sh

# Create directories and set permissions
mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld /var/lib/mysql

# Initialize MariaDB database if not initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB database..."
    mysql_install_db --user=mysql --datadir=/var/lib/mysql --rpm
fi

# Start MariaDB in background
echo "Starting MariaDB in background..."
/usr/bin/mysqld_safe --datadir=/var/lib/mysql --user=mysql --skip-syslog &

# Wait for MariaDB to start up
echo "Waiting for MariaDB to start..."
for i in $(seq 1 30); do
    if mysqladmin ping --silent; then
        break
    fi
    sleep 1
done

echo "MariaDB is ready! Creating database 'todo' and setting password..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS todo;"
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '2205'; FLUSH PRIVILEGES;"

# Start the Spring Boot application
echo "Starting Spring Boot application..."
exec java -jar app.jar
