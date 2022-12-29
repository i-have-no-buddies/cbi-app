require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const compression = require('compression');
const helmet = require('helmet');
const minify = require('express-minify');
const art = require('./config/art');
const expressSession = require('express-session');
const flash = require('connect-flash');
const loginRouter = require('./router/loginRouter');
const leadRouter = require('./router/leadRouter');
const calendarRouter = require('./router/calendarRouter');
const bdmLeadRouter = require('./router/bdmLeadRouter');
const bdmSettingsRouter = require('./router/bdmSettingsRouter');
const bdmSettingsLogsRouter = require('./router/bdmSettingsLogsRouter');
const leadManagementRouter = require('./router/leadManagementRouter');
const reportsRouter = require('./router/reportsRouter');
const userMaintenanceRouter = require('./router/userMaintenanceRouter');
const userLogsRouter = require('./router/userLogsRouter');
const userLogin = require('./router/userLoginRouter');
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
// note: enable trust proxy and cookie secure true
const sessionConfig = {};
const eightHours = 1000 * 60 * 60 * 8;
sessionConfig.secret = APP_SECRET;
sessionConfig.saveUninitialized = true;
sessionConfig.cookie = {};
sessionConfig.cookie.maxAge = eightHours;
sessionConfig.cookie.httpOnly = true;
sessionConfig.cookie.sameSite = true;
sessionConfig.cookie.secure = false;
sessionConfig.resave = false;
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  sessionConfig.cookie.secure = true;
}
app.use(expressSession(sessionConfig));

/**
 * connect flash
 */
app.use(flash());

/**
 * middleware
 */
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  app.use(minify());
}
app.use(express.urlencoded({ extended: false }));

/**
 * user online map
 */
const userOnlineMap = new Map();
// run cleanup every 5 seconds
const cleanupFrequency = 30 * 1000;
// clean out users who haven't been here in the 30 seconds
const cleanupTarget = 2 * 60 * 1000;
function setOnlineUser(req, res, next) {
  if (req.session.AUTH) {
    userOnlineMap.set(req.session.AUTH._id, [
      `${req.session.AUTH.first_name} ${req.session.AUTH.last_name}`,
      req.session.AUTH.email,
      req.session.AUTH.type,
      Date.now(),
      req.route.path,
    ]);
    res.locals.ONLINE = Array.from(userOnlineMap.keys());
    res.locals.LAST_ACTION = Array.from(userOnlineMap.values());
  }
  next();
}
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
leadRouter(app, setOnlineUser);
calendarRouter(app, setOnlineUser);
bdmLeadRouter(app, setOnlineUser);
bdmSettingsRouter(app, setOnlineUser);
bdmSettingsLogsRouter(app, setOnlineUser);
leadManagementRouter(app, setOnlineUser);
reportsRouter(app, setOnlineUser);
userMaintenanceRouter(app, setOnlineUser);
userLogsRouter(app, setOnlineUser);
userLogin(app, setOnlineUser);
userOnlineRouter(app, setOnlineUser);
app.use((req, res) => {
  return res.render('404');
});

/**
 * start server
 */
app.listen(APP_PORT, APP_HOST, () => {
  console.log(`server is running on port ${APP_PORT}`);
});
