const bcryptjs = require('bcryptjs');
const { User, USER_STATUS, USER_TYPE } = require('../model/User');
const { UserLogin, LOGIN_TYPE } = require('../model/UserLogin');

exports.index = (req, res) => {
  try {
    if (req.session.AUTH) {
      if (req.session.AUTH.type === USER_TYPE.SUPER_ADMIN) {
        return res.redirect('/user-maintenance');
      }
      if (req.session.AUTH.type === USER_TYPE.ADMIN) {
        return res.redirect('/lead-management');
      }
      if (req.session.AUTH.type === USER_TYPE.IFA) {
        return res.redirect('/leads');
      }
      if (req.session.AUTH.type === USER_TYPE.BDM) {
        return res.redirect('/bdm-lead');
      }
    }
    return res.render('login');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
      email,
      status: USER_STATUS.ACTIVE,
    }).lean();
    if (!user) {
      return res.redirect('/login');
    }
    const isPasswordMatched = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.redirect('/login');
    }
    req.session.AUTH = user;
    const userLogin = new UserLogin({
      user,
      type: LOGIN_TYPE.LOGIN,
    });
    await userLogin.save();
    if (user.type === USER_TYPE.SUPER_ADMIN) {
      return res.redirect('/user-maintenance');
    }
    if (user.type === USER_TYPE.ADMIN) {
      return res.redirect('/lead-management');
    }
    if (user.type === USER_TYPE.IFA) {
      return res.redirect('/leads');
    }
    if (user.type === USER_TYPE.BDM) {
      return res.redirect('/bdm-lead');
    }
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.logout = async (req, res) => {
  try {
    const userLogin = new UserLogin({
      user: req.session.AUTH,
      type: LOGIN_TYPE.LOGOUT,
    });
    await userLogin.save();
    req.session.destroy();
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
