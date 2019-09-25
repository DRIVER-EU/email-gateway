FROM node:latest AS builder
RUN mkdir /build
WORKDIR /build
COPY . /build
RUN npm i
RUN npm run build

FROM node:latest
RUN mkdir -p /app
# Done with ENV variables: COPY --from=builder /build/gateway-config.json /app/gateway-config.json
COPY --from=builder /build/dist /app/dist
COPY --from=builder /build/node_modules /app/dist/node_modules
# COPY --from=builder /build/ /app/build
WORKDIR /app
# Web socket notifications
EXPOSE 9996
# REST interface
EXPOSE 7891
CMD ["node", "dist/src/index.js"]