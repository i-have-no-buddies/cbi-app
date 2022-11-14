const mongoose = require('mongoose');
const dbName = 'cbi_app';

mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);

mongoose.connection.on('connected', () => console.log('mongodb connected'));
mongoose.connection.on('error', () => console.log('mongodb error'));
mongoose.connection.on('disconnected', () =>
  console.log('mongodb disconnected')
);
