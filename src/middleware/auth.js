const PAGES = {
  '/upload-leads': 'Lead Management',
  '/user-maintenance': 'User Maintenance',
  '/user-maintenance/add': 'User Maintenance',
  '/user-maintenance/edit/:id': 'User Maintenance',
  '/user-online': 'User Online',
};

exports.authenticated = (req, res, next) => {
  try {
    // console.log(req.route.path);
    if (!req.session.AUTH) return res.redirect('/login');
    res.locals.AUTH = req.session.AUTH;
    res.locals.CURRENT_PAGE = PAGES[req.route.path];
    next();
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
