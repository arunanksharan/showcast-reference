FROM node:18.13-alpine

# Set the working directory inside the container
WORKDIR /showcast_kafka

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install TypeScript globally and other dependencies
RUN npm install -g typescript
RUN npm ci

# Copy the rest of your application's source code
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]