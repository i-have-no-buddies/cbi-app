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
const userOnlineRouter = require('./router/userOnlineRouter');
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
 * user online map
 */
const userOnlineMap = new Map();
// run cleanup every 5 seconds
const cleanupFrequency = 5 * 1000;
// clean out users who haven't been here in the 30 seconds
const cleanupTarget = 30 * 1000;
app.use((req, res, next) => {
  if (req.session.AUTH) {
    userOnlineMap.set(
      `${req.session.AUTH.first_name} ${req.session.AUTH.last_name}|${req.session.AUTH.email}`,
      Date.now()
    );
    res.locals.ONLINE = Array.from(userOnlineMap.keys());
  }
  next();
});
setInterval(() => {
  let now = Date.now();
  for (let [id, lastAccess] of userOnlineMap.entries()) {
    if (now - lastAccess > cleanupTarget) {
      // delete users who haven't been here in 30 seconds
      userOnlineMap.delete(id);
    }
  }
}, cleanupFrequency);

/**
 * routes
 */
loginRouter(app);
userMaintenanceRouter(app);
userOnlineRouter(app);
app.use((req, res) => {
  return res.render('404');
});

/**
 * start server
 */
app.listen(APP_PORT, APP_HOST, () => {
  console.log(`server is running on port ${APP_PORT}`);
});
