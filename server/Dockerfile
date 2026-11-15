FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY server ./server
COPY app/package.json ./app/package.json
RUN npm ci && npm run build -w server
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
CMD ["npm", "run", "start", "-w", "server"]