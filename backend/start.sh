#!/bin/bash

# Backend startup script for College Bus Tracking System

echo "Starting College Bus Tracking System Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate  # For Unix/macOS
# For Windows, use: venv\Scripts\activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create sample data if database doesn't exist
if [ ! -f "bus_tracking.db" ]; then
    echo "Creating sample data..."
    python seed_data.py
fi

# Start the FastAPI server
echo "Starting FastAPI server on http://localhost:8000..."
echo "API Documentation available at http://localhost:8000/docs"
python main.py