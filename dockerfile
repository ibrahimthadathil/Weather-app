# First stage: Build the app

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
# up to here the buld stage is completed now the production

# Second stage : Run the app
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app
 
COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve","-s","dist","-l", "5173"] 