FROM rust:alpine

# https://stackoverflow.com/a/30873179
# https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine
# Installs latest Chromium package.
RUN apk update && apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
      gcc musl-dev nodejs
RUN apk add nodejs; if ! type "npm" > /dev/null; then apk add npm; fi
RUN cargo install gifski

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

WORKDIR /app

# install dependencies
ADD package.json .
ADD package-lock.json .
RUN npm ci

# build the app
ADD cli.js .
ADD index.js .
ADD extract.js .
ADD zipit.js .

ENV USE_SANDBOX false
ENV CHROMIUM_PATH /usr/bin/chromium-browser

# CMD node cli.js /source && node extract.js /source && node zipit.js
CMD node zipit.js
