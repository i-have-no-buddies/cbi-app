const { USER_TYPE, USER_STATUS } = require('../model/User');
const { UserLogin, LOGIN_TYPE } = require('../model/UserLogin');
const { LEAD_STATUS, OUTCOME, HIERARCHY } = require('../model/Lead');
const { PRODUCTS, PROGRAMS } = require('../model/StatusLog');
const { REPORT_TYPE } = require('../model/ReportLog');
var { getInactiveUsers, removeInactiveUser } = require('../utils/helper');

const PAGES = {
  '/initial-meeting': 'Initial Meeting',
  '/initial-meeting/edit/:id': 'Initial Meeting',
  '/initial-meeting/update': 'Initial Meeting',
  '/initial-meeting/update-status': 'Initial Meeting',
  '/initial-meeting/meeting-update': 'Initial Meeting',
  '/lead': 'Lead',
  '/lead/edit/:id': 'Lead',
  '/lead/update': 'Lead',
  '/lead/edit-logs/:_id': 'Lead',
  '/lead/update-status': 'Lead',
  '/lead/meeting-update': 'Lead',
  '/calendar': 'Calendar',
  '/bdm-lead': 'BDM Lead',
  '/bdm-lead/:_id': 'BDM Lead',
  '/bdm-settings': 'BDM Settings',
  '/bdm-settings/add': 'BDM Settings',
  '/bdm-settings/create': 'BDM Settings',
  '/bdm-settings/edit/:_id': 'BDM Settings',
  '/bdm-settings/update/:_id': 'BDM Settings',
  '/bdm-settings/delete/:_id': 'BDM Settings',
  '/bdm-settings-logs': 'BDM Settings Logs',
  '/bdm-settings-logs/:_id': 'BDM Settings Logs',
  '/lead-management': 'Lead Management',
  '/lead-management/upload': 'Lead Management',
  '/lead-management/new_upload': 'Lead Management',
  '/lead-management/edit/:id': 'Lead Management',
  '/lead-management/update': 'Lead Management',
  '/lead-management/add': 'Lead Management',
  '/lead-management/create': 'Lead Management',
  '/reports': 'Reports',
  '/reports/users': 'Reports',
  '/reports/user-logs': 'Reports',
  '/reports/user-logins': 'Reports',
  '/user-maintenance': 'User Maintenance',
  '/user-maintenance/add': 'User Maintenance',
  '/user-maintenance/create': 'User Maintenance',
  '/user-maintenance/edit/:_id': 'User Maintenance',
  '/user-maintenance/update/:_id': 'User Maintenance',
  '/user-logs': 'User Logs',
  '/user-logs/:_id': 'User Logs',
  '/user-login': 'User Login',
  '/user-online': 'User Online',
};

const ACCESS_MODULES = {
  SUPER_ADMIN: [
    '/initial-meeting',
    '/initial-meeting/edit/:id',
    '/initial-meeting/update',
    '/initial-meeting/update-status',
    '/initial-meeting/meeting-update',
    '/lead',
    '/lead/edit/:id',
    '/lead/update',
    '/lead/edit-logs/:_id',
    '/lead/update-status',
    '/lead/meeting-update',
    '/calendar',
    '/bdm-lead',
    '/bdm-lead/:_id',
    '/bdm-settings',
    '/bdm-settings/add',
    '/bdm-settings/create',
    '/bdm-settings/edit/:_id',
    '/bdm-settings/update/:_id',
    '/bdm-settings/delete/:_id',
    '/bdm-settings-logs',
    '/bdm-settings-logs/:_id',
    '/lead-management',
    '/lead-management/upload',
    '/lead-management/new_upload',
    '/lead-management/edit/:id',
    '/lead-management/update',
    '/lead-management/add',
    '/lead-management/create',
    '/reports',
    '/reports/users',
    '/reports/user-logs',
    '/reports/user-logins',
    '/user-maintenance',
    '/user-maintenance/add',
    '/user-maintenance/create',
    '/user-maintenance/edit/:_id',
    '/user-maintenance/update/:_id',
    '/user-logs',
    '/user-logs/:_id',
    '/user-login',
    '/user-online',
    '/logout',
  ],
  ADMIN: [
    '/initial-meeting',
    '/initial-meeting/edit/:id',
    '/initial-meeting/update',
    '/initial-meeting/update-status',
    '/initial-meeting/meeting-update',
    '/lead',
    '/lead/edit/:id',
    '/lead/update',
    '/lead/edit-logs/:_id',
    '/lead/update-status',
    '/lead/meeting-update',
    '/calendar',
    '/bdm-lead',
    '/bdm-lead/:_id',
    '/bdm-settings',
    '/bdm-settings/add',
    '/bdm-settings/create',
    '/bdm-settings/edit/:_id',
    '/bdm-settings/update/:_id',
    '/bdm-settings/delete/:_id',
    '/bdm-settings-logs',
    '/bdm-settings-logs/:_id',
    '/lead-management',
    '/lead-management/upload',
    '/lead-management/new_upload',
    '/lead-management/edit/:id',
    '/lead-management/update',
    '/lead-management/add',
    '/lead-management/create',
    '/reports',
    '/reports/users',
    '/reports/user-logs',
    '/reports/user-logins',
    '/logout',
  ],
  IFA: [
    '/initial-meeting',
    '/initial-meeting/edit/:id',
    '/initial-meeting/update',
    '/initial-meeting/update-status',
    '/initial-meeting/meeting-update',
    '/lead',
    '/lead/edit/:id',
    '/lead/update',
    '/lead/edit-logs/:_id',
    '/lead/update-status',
    '/lead/meeting-update',
    '/calendar',
    '/logout',
  ],
  BDM: [
    '/bdm-lead',
    '/bdm-lead/:_id',
    '/bdm-settings',
    '/bdm-settings/add',
    '/bdm-settings/create',
    '/logout',
  ],
};


const INITIAL_ROUTES = [
  '/initial-meeting',
  '/initial-meeting/edit/:id',
  '/initial-meeting/update',
  '/initial-meeting/update-status',
  '/initial-meeting/meeting-update',
];
const LEAD_ROUTES = [
  '/lead',
  '/lead/edit/:id',
  '/lead/update',
  '/lead/edit-logs/:_id',
  '/lead/update-status',
  '/lead/meeting-update',
];

exports.authenticated = async (req, res, next) => {
  try {
    /**
     * redirect unathenicated users
     */
    if (!req.session.AUTH) {
      return res.redirect('/login');
    }
    /**
     * redirect users that do not have access to the route
     */
    if (!ACCESS_MODULES[req.session.AUTH.type].includes(req.route.path)) {
      return res.redirect('/login');
    }
    /**
     * remove new update stage in quality assurance route
     */
    let NEW_LEAD_STATUS = { ...LEAD_STATUS };
    if (INITIAL_ROUTES.includes(req.route.path)) {
      delete OUTCOME.NEW;
      delete NEW_LEAD_STATUS.NEW;
      delete NEW_LEAD_STATUS.FIRST_MEETING;
      delete NEW_LEAD_STATUS.SECOND_MEETING;
      delete NEW_LEAD_STATUS.CLIENT;
    }

    if (LEAD_ROUTES.includes(req.route.path)) {
      delete OUTCOME.NEW;
      delete NEW_LEAD_STATUS.NEW;
      delete NEW_LEAD_STATUS.FIRST_MEETING;
      delete NEW_LEAD_STATUS.SECOND_MEETING;

      delete HIERARCHY.CANCELED;
    }
    
    

    /**
     * log out inactive users
     */
    if (getInactiveUsers().includes(req.session.AUTH._id.toString())) {
      removeInactiveUser(req.session.AUTH._id.toString());
      const userLogin = new UserLogin({
        user: req.session.AUTH,
        type: LOGIN_TYPE.LOG_OUT,
      });
      await userLogin.save();
      req.session.destroy();
      return res.redirect('/login');
    }
    /**
     * pass constant to views
     */
    res.locals.AUTH = req.session.AUTH;
    res.locals.CURRENT_PAGE = PAGES[req.route.path];
    res.locals.CURRENT_DATE = new Date();
    res.locals.USER_TYPE = USER_TYPE;
    res.locals.USER_STATUS = USER_STATUS;
    res.locals.LOGIN_TYPE = LOGIN_TYPE;
    res.locals.REPORT_TYPE = REPORT_TYPE;
    res.locals.LEAD_STATUS = NEW_LEAD_STATUS;
    res.locals.OUTCOME = OUTCOME;
    res.locals.HIERARCHY = HIERARCHY;
    res.locals.PRODUCTS = PRODUCTS;
    res.locals.PROGRAMS = PROGRAMS;
    
    next();
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
