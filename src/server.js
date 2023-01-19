require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const compression = require('compression');
const helmet = require('helmet');
const minify = require('express-minify');
const art = require('./config/art');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession);
const flash = require('connect-flash');
const loginRouter = require('./router/loginRouter');
const initialMeetingRouter = require('./router/initialMeetingRouter');
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
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Events = require('events');

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
const sessionConfig = {};
const eightHours = 1000 * 60 * 60 * 8;
app.set('trust proxy', 1);
sessionConfig.secret = APP_SECRET;
sessionConfig.saveUninitialized = true;
sessionConfig.cookie = {};
sessionConfig.cookie.maxAge = eightHours;
sessionConfig.cookie.httpOnly = true;
sessionConfig.cookie.sameSite = true;
sessionConfig.cookie.secure = false;
sessionConfig.resave = false;
if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.secure = true;
}
sessionConfig.store = new MemoryStore({
  checkPeriod: eightHours, // prune expired entries every 8h
});
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
const cleanupFrequency = 5 * 1000; // run cleanup every 5 seconds
const cleanupTarget = 2 * 60 * 1000; // clean out users who haven't been here in 2 minutes
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
  for (let [id, details] of userOnlineMap.entries()) {
    let lastAccess = details[3];
    // delete users who haven't been here in 2 minutes
    if (now - lastAccess > cleanupTarget) {
      userOnlineMap.delete(id);
    }
  }
}, cleanupFrequency);

/**
 * web socket
 */
io.on('connection', function (socket) {
  var eventEmitter = new Events.EventEmitter();
  eventEmitter.on('reloadEvent', (msg) => {
    io.sockets.emit('page reload', msg);
  });
  exports.emitter = eventEmitter;
});

/**
 * routes
 */
loginRouter(app);
initialMeetingRouter(app, setOnlineUser);
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
