exports.authenticated = (req, res, next) => {
  try {
    // console.log(req.route.path);
    if (!req.session.AUTH) return res.redirect('/login');
    res.locals.AUTH = req.session.AUTH;
    next();
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
