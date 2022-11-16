const { Upload, FILE_HEADERS } = require('../model/Upload')
const fs = require('fs')
const csv = require('@fast-csv/parse')
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
    const stream = fs.createReadStream(`./public/uploads/${req.file.filename}`)

    csv
      .parseStream(stream, { headers: true, ignoreEmpty: true })
      .on('error', (error) => console.error(error))
      .on('data', (row) => console.log(row))
      .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`))

    res.redirect('/upload-leads')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}
