const { User, USER_TYPE, USER_STATUS } = require('../model/User');
const PER_PAGE = 9;
const navigation = 'user_maintenance';

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
      navigation,
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
    return res.render('user_maintenance_add', { USER_TYPE, navigation });
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
      navigation,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findById(req.body._id);
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
