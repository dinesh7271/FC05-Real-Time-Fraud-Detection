FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend package (build context is the project root)
COPY backend/ ./backend/

# Expose port
EXPOSE 8000

# Run from project root so relative imports work: backend is a package under /app/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
