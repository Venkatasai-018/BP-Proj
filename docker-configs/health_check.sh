#!/bin/bash

# Health check script for the Bus Tracking System

# Check if FastAPI is running
if ! curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    echo "FastAPI is not responding"
    exit 1
fi

# Check if PostgreSQL is running
if ! sudo -u postgres psql -d bus_tracking -c "SELECT 1" > /dev/null 2>&1; then
    echo "PostgreSQL is not responding"
    exit 1
fi

# Check if Nginx is serving content
if ! curl -f http://localhost/ > /dev/null 2>&1; then
    echo "Nginx is not serving content"
    exit 1
fi

echo "All services are healthy"
exit 0