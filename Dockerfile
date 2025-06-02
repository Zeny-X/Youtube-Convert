FROM node:22

# Install yt-dlp
RUN apt-get update && apt-get install -y yt-dlp ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
