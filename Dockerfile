FROM node:14.18-alpine3.14

# Create app directory
WORKDIR /usr/src/app/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Bundle app source
COPY . /usr/src/app/
COPY .env /usr/src/app/
# If you are building your code for production
# RUN npm ci --only=production

RUN npm ci --only=production

EXPOSE 9000