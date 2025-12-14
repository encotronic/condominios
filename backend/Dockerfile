FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (production only)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Default port
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
