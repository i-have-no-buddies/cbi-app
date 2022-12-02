const { LEAD_STATUS } = require('../../model/Lead');
const { check, validationResult } = require('express-validator');
const { errorFormater } = require('../../utils/helper.js');

exports.validateLeadAdd = [
  check('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('First name must be minimum of 2 characters.')
    .bail(),
  check('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Last name must be minimum of 2 characters.')
    .bail(),
  check('job_title')
    .trim()
    .notEmpty()
    .withMessage('Job Title is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Job Title must be minimum of 2 characters.')
    .bail(),
  check('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Company must be minimum of 2 characters.')
    .bail(),
  check('profile_link')
    .trim()
    .notEmpty()
    .withMessage('Profile Link is required.')
    .bail()
    .isURL()
    .withMessage('Profile Link is invalid URL')
    .bail(),
  check('gender').trim().notEmpty().withMessage('Gender is required.').bail(),
  //update regex?
  check('business_no')
    .trim()
    .notEmpty()
    .withMessage('Profile Link is required.')
    .bail(),
  // check('second_mobile')
  //     .trim()
  //     .notEmpty()
  //     .withMessage('Second Mobile is required.')
  //     .bail(),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Email is invalid.')
    .bail(),
  check('second_email')
    .trim()
    .isEmail()
    .withMessage('Second Email is invalid.')
    .bail(),
  check('nationality')
    .trim()
    .notEmpty()
    .withMessage('Nationality is required.')
    .bail(),
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .bail(),
  function (req, res, next) {
    const errors = validationResult(req);
    let error_results;
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors);
      return res.render('lead_add', {
        lead: req.body,
        errors: error_results,
      });
    }
    next();
  },
];

exports.validateLeadEdit = [
  check('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('First name must be minimum of 2 characters.')
    .bail(),
  check('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Last name must be minimum of 2 characters.')
    .bail(),
  check('job_title')
    .trim()
    .notEmpty()
    .withMessage('Job Title is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Job Title must be minimum of 2 characters.')
    .bail(),
  check('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Company must be minimum of 2 characters.')
    .bail(),
  check('profile_link')
    .trim()
    .notEmpty()
    .withMessage('Profile Link is required.')
    .bail()
    .isURL()
    .withMessage('Profile Link is invalid URL')
    .bail(),
  check('gender').trim().notEmpty().withMessage('Gender is required.').bail(),
  //update regex?
  check('business_no')
    .trim()
    .notEmpty()
    .withMessage('Profile Link is required.')
    .bail(),
  // check('second_mobile')
  //     .trim()
  //     .notEmpty()
  //     .withMessage('Second Mobile is required.')
  //     .bail(),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Email is invalid.')
    .bail(),
  check('second_email')
    .trim()
    .isEmail()
    .withMessage('Second Email is invalid.')
    .bail(),
  check('nationality')
    .trim()
    .notEmpty()
    .withMessage('Nationality is required.')
    .bail(),
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .bail(),
  function (req, res, next) {
    const errors = validationResult(req);
    let error_results;
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors);
      return res.render('lead_edit', {
        LEAD_STATUS,
        lead: req.body,
        errors: error_results,
      });
    }
    next();
  },
];

exports.validateLeadStatusEdit = [
  check('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required.')
    .bail()
    .custom((status) => {
      let arrLeadStatus = Object.values(LEAD_STATUS);
      if (!arrLeadStatus.includes(status)) {
        throw new Error('Status invalid.');
      } else {
        return true;
      }
    })
    .bail(),
  check('note').trim().notEmpty().withMessage('Note is required.').bail(),
  check('date').trim().notEmpty().withMessage('Date is required.').bail(),
  check('time').trim().notEmpty().withMessage('Time is required.').bail(),
  function (req, res, next) {
    const errors = validationResult(req);
    let error_results;
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors);
      return res.render('lead_edit', {
        LEAD_STATUS,
        lead: req.body,
        errors: error_results,
      });
    }
    next();
  },
];
