const { check, checkSchema, validationResult } = require('express-validator')
const { errorFormater } = require('../../utils/helper.js')
const multer = require('multer')
const moment = require('moment')
var fs = require('fs')
let valid_files = ['xlsx', 'csv', 'xls']

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
  if (valid_files.includes(file_type)) cb(null, true)
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
        errorMessage: 'File is Invalid',
      },
    },
  }),
  function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      //with error undo upload
      if (req.file) fs.unlinkSync(`./public/uploads/${req.file.filename}`)
      let error_results = errorFormater(errors)
      req.flash('body', req.body)
      req.flash('error', error_results)
      return res.redirect('/upload-leads')
    }
    next()
  },
]
