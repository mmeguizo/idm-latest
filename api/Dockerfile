# Use a base image for Node.js
FROM node:16-alpine

# Set working directory inside the container
WORKDIR /app

# Copy your application code
COPY . .

# Install dependencies
RUN npm install

# Expose port (replace 3000 with your actual port if needed)
EXPOSE 3000

# Define environment variable for MongoDB connection string
ENV DB_URL=mongodb://localhost:27017
# Start the application (replace "npm start" with your actual start command)
CMD [ "npm", "start" ]
