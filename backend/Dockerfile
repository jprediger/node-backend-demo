FROM node:20-alpine

WORKDIR /app

# Copy package files from backend directory
COPY ./package.json ./pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy application code from backend directory
COPY ./ .

# Expose port (default 8080, configurable via PORT env var at runtime)
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]

