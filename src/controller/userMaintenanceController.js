const { User, USER_TYPE, USER_STATUS } = require('../model/User')
const PER_PAGE = 9
const navigation = 'user_maintenance'

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1
    const search = {}
    if (req.query.search) {
      search['tags.tag'] = req.query.search.toLowerCase().trim()
    }
    const users = await User.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    })
    return res.render('user_maintenance', {
      users,
      search: req.query.search || '',
      navigation,
    })
  } catch (error) {
    console.error(error)
    return res.render(500)
  }
}

exports.add = (req, res) => {
  try {
    return res.render('user_maintenance_add', { USER_TYPE, navigation })
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.create = async (req, res) => {
  try {
    const user = new User({
      ...req.body,
    })
    await user.save()
    return res.redirect('/user-maintenance')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.edit = async (req, res) => {
  try {
    const id = req.params.id
    const user = await User.findById(id).lean()
    user.password = ''
    return res.render('user_maintenance_edit', {
      user,
      USER_TYPE,
      USER_STATUS,
      navigation,
    })
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

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
    console.error(error)
    return res.render('500')
  }
}
