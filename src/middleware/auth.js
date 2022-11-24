const PAGES = {
  '/lead': 'Lead',
  '/lead/edit/:id': 'Lead',
  '/lead/update': 'Lead',
  '/calendar': 'Calendar',
  '/bdm': 'BDM',
  '/bdm-settings': 'BDM Settings',
  '/bdm-settings/add': 'BDM Settings',
  '/bdm-settings/create': 'BDM Settings',
  '/lead-management': 'Lead Management',
  '/lead-management/upload': 'Lead Management',
  '/lead-management/edit/:id': 'Lead Management',
  '/lead-management/update': 'Lead Management',
  '/lead-management/add': 'Lead Management',
  '/lead-management/create': 'Lead Management',
  '/user-maintenance': 'User Maintenance',
  '/user-maintenance/add': 'User Maintenance',
  '/user-maintenance/create': 'User Maintenance',
  '/user-maintenance/edit/:id': 'User Maintenance',
  '/user-online': 'User Online',
};

exports.authenticated = (req, res, next) => {
  try {
    if (!req.session.AUTH) return res.redirect('/login');
    res.locals.AUTH = req.session.AUTH;
    res.locals.CURRENT_PAGE = PAGES[req.route.path];
    next();
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
