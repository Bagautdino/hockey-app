# -- Backend: FastAPI + uvicorn --
# Build context: ./backend (set in docker-compose.prod.yml)
# PYTHONPATH=/app ensures `from app.xxx import ...` works everywhere:
# uvicorn, alembic, init_db, tests.

FROM python:3.12-slim
WORKDIR /app

# curl is needed for Docker healthcheck (CMD curl ...)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
