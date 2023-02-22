import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionURL: process.env.MONGODB_CONNECTION_STRING,
  },
  server: {
    port: process.env.PORT || 9000,
  },
  jwt_secret: process.env.JWTSECRET
};
