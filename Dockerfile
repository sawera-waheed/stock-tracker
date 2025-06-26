# Dockerfile

# Step 1: Use official Node.js image
FROM node:20-alpine

# Step 2: Set working directory
WORKDIR /src

# Step 3: Copy package.json and lock file
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy all app code
COPY . .

# Step 6: Build the Next.js app
RUN npm run build

# Step 7: Expose the port Next.js runs on
EXPOSE 3000

# Step 8: Start the Next.js app
CMD ["npm", "start"]
