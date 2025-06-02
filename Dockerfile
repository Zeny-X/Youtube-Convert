# Use the latest Node.js 22 image
FROM node:22

# Install dependencies: ffmpeg and curl
RUN apt-get update && apt-get install -y ffmpeg curl

# Install the latest yt-dlp binary directly from GitHub
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

# Create the app directory
WORKDIR /usr/src/app

# Copy dependencies and install them
COPY package.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
