# Base image with Python 3.11 runtime
FROM python:3.11-slim AS base

# Ensure stdout/stderr are unbuffered and pip is quiet
ENV PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies (add build tools only if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies separately to leverage Docker layer caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Default command runs the FastAPI app
# If your entrypoint changes, update "app.main:app" accordingly
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


