require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const compression = require('compression');
const helmet = require('helmet');
const minify = require('express-minify');
const art = require('./config/art');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const loginRouter = require('./router/loginRouter');
const userMaintenanceRouter = require('./router/userMaintenanceRouter');
const APP_HOST = process.env.APP_HOST;
const APP_PORT = process.env.APP_PORT;
const APP_SECRET = process.env.APP_SECRET;

/**
 * database connection
 */
require('./config/mongodb');

/**
 * helmet
 */
app.use(helmet({ contentSecurityPolicy: false }));

/**
 * static file
 */
app.use(
  '/',
  express.static(path.join(__dirname, '..\\public\\'), {
    bufferSize: 65536,
    maxAge: 1000 * 60 * 60 * 24,
  })
);

/**
 * view engine
 */
app.engine('html', art);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..\\templates\\views'));

/**
 * session
 */
app.use(cookieParser(APP_SECRET));
app.use(
  cookieSession({
    secret: APP_SECRET,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 28800000,
      sameSite: true,
      secure: true,
    },
    resave: false,
  })
);

/**
 * middleware
 */
app.use(compression());
app.use(minify());
app.use(express.urlencoded({ extended: false }));

/**
 * routes
 */
loginRouter(app);
userMaintenanceRouter(app);
app.use((req, res) => {
  return res.render('404');
});

/**
 * start server
 */
app.listen(APP_PORT, APP_HOST, () => {
  console.log(`server is running on port ${APP_PORT}`);
});
