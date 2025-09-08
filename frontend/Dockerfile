# Use a Node.js base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# Expose the port that the Next.js server runs on
EXPOSE 3000

# Specify the command to run the application
# This uses the 'dev' script from your package.json
CMD ["npm", "run", "dev"]