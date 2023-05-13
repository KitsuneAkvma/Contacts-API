FROM node:14-alpine
WORKDIR .
COPY package*.json ./
ENV DB_URI=<your_mongodb_uri>
ENV JWT_SECRET=<your_jwt_secret>
ENV SENDGRID_API_KEY=<your_sendgrid_api_key>
RUN npm install
COPY . .
ENV PORT=8080
CMD npm start
