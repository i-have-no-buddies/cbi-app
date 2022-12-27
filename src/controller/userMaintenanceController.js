const { User, USER_TYPE, USER_STATUS } = require('../model/User');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const bcryptjs = require('bcryptjs');
const PER_PAGE = 9;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['first_name', 'last_name', 'email', 'type', 'status'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const users = await User.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    });
    return res.render('user_maintenance', {
      users,
      search: query_params,
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
    return res.render('user_maintenance_add', { user });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.create = async (req, res) => {
  try {
    const user = new User(req.body);
    user.password = await bcryptjs.hash(user.password, 8);
    user.status = USER_STATUS.ACTIVE;
    user.created_by = req.session.AUTH._id;
    user.updated_by = req.session.AUTH._id;
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
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    for (const property in req.body) {
      if (property !== '_id' && req.body[property]) {
        user[property] = req.body[property];
        if (property === 'password') {
          user[property] = await bcryptjs.hash(req.body[property], 8);
        }
      }
    }
    user.updated_at = new Date();
    user.updated_by = req.session.AUTH._id;
    await user.save();
    return res.redirect('/user-maintenance');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
