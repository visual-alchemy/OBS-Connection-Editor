# Use a Node.js base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Install smbclient
# Alpine Linux uses 'apk add' for package management
RUN apk add --no-cache samba-client

# Expose the port the app runs on
EXPOSE 3112

# Command to run the application
CMD ["npm", "run", "start"]
