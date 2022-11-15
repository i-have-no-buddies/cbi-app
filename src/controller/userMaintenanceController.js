const { User, USER_TYPE, USER_STATUS } = require('../model/User');
const PER_PAGE = 9;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search = {};
    if (req.query.search) {
      search['tags.tag'] = req.query.search.toLowerCase().trim();
    }
    const users = await User.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    });
    return res.render('user_maintenance', {
      users,
      search: req.query.search || '',
    });
  } catch (error) {
    console.error(error);
    return res.render(500);
  }
};

exports.add = (req, res) => {
  try {
    return res.render('user_maintenance_add', { USER_TYPE });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.create = async (req, res) => {
  try {
    const user = new User({
      ...req.body,
    });
    await user.save();
    return res.redirect('/user-maintenance');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).lean();
    user.password = '';
    return res.render('user_maintenance_edit', {
      user,
      USER_TYPE,
      USER_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update = async (req, res) => {
  try {
    const {
      id,
      first_name,
      last_name,
      email,
      phone_number = null,
      password,
      type,
      status,
    } = req.body;
    const user = await User.findById(id);
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    if (phone_number) {
      user.phone_number = phone_number;
    }
    if (password) {
      user.password = password;
    }
    user.type = type;
    user.status = status;
    await user.save();
    return res.redirect('/user-maintenance');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
