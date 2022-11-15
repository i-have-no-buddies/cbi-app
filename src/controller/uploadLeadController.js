const navigation = 'upload_lead'

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1
    const search = {}
    return res.render('upload_leads', {
      search: req.query.search || '',
      body: req.flash('body')[0],
      errors: req.flash('error')[0],
      navigation,
    })
  } catch (error) {
    console.error(error)
    return res.render(500)
  }
}

exports.upload = (req, res) => {
  try {
    res.redirect('/user-maintenance')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}
