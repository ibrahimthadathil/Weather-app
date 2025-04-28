# First stage: Build the app

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
# up to here the buld stage is completed now the production

# Second stage : Run the app
FROM node:20-alpine

npm install package -g serve

WORKDIR /app

EXPOSE 5173

CMD ['serve','-s','dist']