const { User, USER_TYPE, USER_STATUS } = require('../model/User');
const PER_PAGE = 9;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    let search = [];
    if (req.query.name) {
      search.push({ 'tags.tag': req.query.name.toLowerCase().trim() });
    }
    if (req.query.type) {
      search.push({ 'tags.tag': req.query.type.toLowerCase().trim() });
    }
    if (req.query.status) {
      search.push({ 'tags.tag': req.query.status.toLowerCase().trim() });
    }
    if (search.length) {
      search = { $and: search };
    } else {
      search = {};
    }
    const users = await User.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    });
    return res.render('user_maintenance', {
      users,
      search: {
        name: req.query.name || '',
        type: req.query.type || '',
        status: req.query.status || '',
      },
      USER_TYPE,
      USER_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render(500);
  }
};

exports.add = (req, res) => {
  try {
    const user = {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      password: '',
      type: '',
    };
    return res.render('user_maintenance_add', { user, USER_TYPE });
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
    const _id = req.params._id;
    const user = await User.findById(_id)
      .select({
        first_name: 1,
        last_name: 1,
        phone_number: 1,
        email: 1,
        password: 1,
        type: 1,
        status: 1,
      })
      .lean();
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
    const user = await User.findById(req.params._id);
    if (!req.body.password) {
      delete req.body.password;
    }
    for (const property in req.body) {
      if (property !== '_id') {
        user[property] = req.body[property];
      }
    }
    await user.save();
    return res.redirect('/user-maintenance');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
