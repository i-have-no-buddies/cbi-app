const { USER_TYPE, USER_STATUS } = require('../model/User');
const { LOGIN_TYPE } = require('../model/UserLogin');

const PAGES = {
  '/lead': 'Lead',
  '/lead/edit/:id': 'Lead',
  '/lead/update': 'Lead',
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
  '/lead-management/edit/:id': 'Lead Management',
  '/lead-management/update': 'Lead Management',
  '/lead-management/add': 'Lead Management',
  '/lead-management/create': 'Lead Management',
  '/reports': 'Reports',
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
    '/lead',
    '/lead/edit/:id',
    '/lead/update',
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
    '/lead-management/edit/:id',
    '/lead-management/update',
    '/lead-management/add',
    '/lead-management/create',
    '/reports',
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
    '/lead',
    '/lead/edit/:id',
    '/lead/update',
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
    '/lead-management/edit/:id',
    '/lead-management/update',
    '/lead-management/add',
    '/lead-management/create',
    '/reports',
    '/logout',
  ],
  IFA: ['/lead', '/lead/edit/:id', '/lead/update', '/calendar', '/logout'],
  BDM: [
    '/bdm-lead',
    '/bdm-lead/:_id',
    '/bdm-settings',
    '/bdm-settings/add',
    '/bdm-settings/create',
    '/logout',
  ],
};

exports.authenticated = (req, res, next) => {
  try {
    if (!req.session.AUTH) {
      return res.redirect('/login');
    }
    if (!ACCESS_MODULES[req.session.AUTH.type].includes(req.route.path)) {
      return res.redirect('/login');
    }
    res.locals.AUTH = req.session.AUTH;
    res.locals.CURRENT_PAGE = PAGES[req.route.path];
    res.locals.CURRENT_DATE = new Date();
    res.locals.USER_TYPE = USER_TYPE;
    res.locals.USER_STATUS = USER_STATUS;
    res.locals.LOGIN_TYPE = LOGIN_TYPE;
    next();
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
