const PAGES = {
  '/bdm': 'BDM',
  '/bdm-settings': 'BDM Settings',
  '/bdm-settings/add': 'BDM Settings',
  '/bdm-settings/create': 'BDM Settings',
  '/upload-leads': 'Lead Management',
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
