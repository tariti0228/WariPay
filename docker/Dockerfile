FROM node:22-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install global @expo/ngrok for tunnel support
RUN npm install -g @expo/ngrok@^4.1.0

# Copy the rest of the app
COPY . .

# Expose ports
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Set environment variables
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start the app with tunnel
CMD ["npx", "expo", "start", "--tunnel"] 