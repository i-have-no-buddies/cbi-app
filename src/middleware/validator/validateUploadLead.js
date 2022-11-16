const { check, checkSchema, validationResult } = require('express-validator')
const { errorFormater, readHeader } = require('../../utils/helper.js')
const multer = require('multer')
const moment = require('moment')
const { FILE_HEADERS } = require('../../model/LeadBatch')
var fs = require('fs')

const multerStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: async function (req, file, cb) {
    let ogn = file.originalname
    let file_name = moment().format('YYYYMMDDHHmmssms')
    file_name += ogn.substring(ogn.lastIndexOf('.'), ogn.length)
    cb(null, file_name)
  },
})
const multerFilter = (req, file, cb) => {
  let file_type = file.mimetype.split('/')[1]
  if (file_type === 'csv') cb(null, true)
  else cb(null, false)
}
const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

exports.validateUploadLead = [
  upload.single('file_input'),
  check('upload_name')
    .trim()
    .notEmpty()
    .withMessage('Upload name is required.')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Upload name must be minimum of 5 characters.')
    .bail(),
  checkSchema({
    file_input: {
      custom: {
        options: (value, { req, path }) => {
          //this will show return true if file is uploaded
          return !!req.file
        },
        errorMessage: 'File is Invalid (Please upload csv file).',
      },
    },
  }),
  async function (req, res, next) {
    const errors = validationResult(req)
    let file_location = `./public/uploads/${req.file?.filename}`
    var error_results

    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
    } else {
      //validate file content
      let missing = ''
      let header_row = await readHeader(file_location)
      for (value of FILE_HEADERS) {
        if (!header_row.includes(value)) missing += `${value}, `
      }
      if (missing != '') {
        error_results = {
          file_input: missing.slice(0, -2) + ' in header does not exist.',
        }
      }
    }

    if (error_results) {
      //with error undo upload
      if (req.file) fs.unlinkSync(file_location)
      req.flash('error', error_results)
      req.flash('body', req.body)
      return res.redirect('/lead-management')
    }

    next()
  },
]
