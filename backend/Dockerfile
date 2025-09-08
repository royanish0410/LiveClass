# Use a Node.js base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
# This is a common optimization to cache dependency installations
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# Expose the port that the backend server runs on
EXPOSE 5000

# Specify the command to run the application
# This uses the 'dev' script from your package.json
CMD ["npm", "run", "dev"]