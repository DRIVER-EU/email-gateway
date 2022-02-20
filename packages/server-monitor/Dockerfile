FROM node:latest AS builder
COPY . ./app
WORKDIR /app
RUN npm i
RUN $(npm bin)/ng build --base-href /mailmonitor/

FROM nginx:latest
COPY ./index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/dist/server-monitor/ /usr/share/nginx/html/mailmonitor