FROM node:18 AS build
WORKDIR /app

# Optimize: Copy package files first to cache dependencies
COPY package*.json ./
RUN npm install

# Then copy the rest of the code
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 81
# The default CMD for nginx:alpine is usually sufficient, 
# but being explicit captures logs better
CMD ["nginx", "-g", "daemon off;"] 