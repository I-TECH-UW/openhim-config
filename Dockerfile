FROM node:latest

WORKDIR /app

ADD package.json /app/
ADD yarn.lock /app/
ADD docker-entrypoint.sh /app/
ADD load-openhim-config.js /app/
ADD auth.js /app/
ADD test-openhim-config-template.json /app/test-openhim-config.json

RUN chmod u+x docker-entrypoint.sh load-openhim-config.js auth.js

RUN yarn

ENV API_URL='https://openhim-core:8080'
ENV INITIAL_PW='openhim-password'
ENV ADMIN_PW='openhim'
ENV ODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ./docker-entrypoint.sh