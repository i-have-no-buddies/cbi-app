const bcryptjs = require('bcryptjs')
const { User, USER_STATUS, USER_ACCESS } = require('../model/User')

exports.index = (req, res) => {
  try {
    if (req.session.AUTH) return res.redirect('/user-maintenance')
    return res.render('login')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.login = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({
      email,
      status: USER_STATUS.ACTIVE,
    }).lean()
    if (!user) {
      return res.redirect('/login')
    }
    const isPasswordMatched = await bcryptjs.compare(password, user.password)
    if (!isPasswordMatched) {
      return res.redirect('/login')
    }
    //can be dynamic if added to db for nav view
    user.access = USER_ACCESS[user.type.replace(' ', '_')]
    req.session.AUTH = user

    return res.redirect('/user-maintenance')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.logout = (req, res) => {
  try {
    req.session = null
    return res.redirect('/login')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}
