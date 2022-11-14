require('dotenv').config();
const mongoose = require('mongoose');
const APP_HOST = process.env.APP_HOST;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(`mongodb://${APP_HOST}:27017/${DB_NAME}`);

mongoose.connection.on('connected', () => console.log('mongodb connected'));
mongoose.connection.on('error', () => console.log('mongodb error'));
mongoose.connection.on('disconnected', () =>
  console.log('mongodb disconnected')
);
