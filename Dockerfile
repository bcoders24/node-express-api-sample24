# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Install PM2 globally
RUN npm install -g pm2

# Expose the port on which your application will run
EXPOSE 3000

# Use PM2 to start your application
CMD ["pm2-runtime", "index.js"]
