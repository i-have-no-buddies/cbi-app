const { check, validationResult } = require('express-validator')

const { LEAD_STATUS, OUTCOME } = require('../../model/Lead')
const { StatusLog } = require('../../model/StatusLog')

const { errorFormater } = require('../../utils/helper.js')

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
  check('personal_email')
    .trim()
    .notEmpty()
    .withMessage('Personal Email is required.')
    .bail()
    .isEmail()
    .withMessage('Personal Email is invalid.')
    .bail(),
  check('work_email')
    .trim()
    .isEmail()
    .withMessage('Work Email is invalid.')
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
    const errors = validationResult(req)
    let error_results
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
      return res.render('lead_add', {
        lead: req.body,
        errors: error_results,
      })
    }
    next()
  },
]

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
  check('nationality')
    .trim()
    .notEmpty()
    .withMessage('Nationality is required.')
    .bail(),
  check('country').trim().notEmpty().withMessage('Country is required.').bail(),
  check('city').trim().notEmpty().withMessage('City is required.').bail(),
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
  check('personal_email')
    .trim()
    .notEmpty()
    .withMessage('Personal Email is required.')
    .bail()
    .isEmail()
    .withMessage('Personal Email is invalid.')
    .bail(),
  check('work_email')
    .trim()
    .isEmail()
    .withMessage('Second Email is invalid.')
    .bail(),
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .bail(),
  async function (req, res, next) {
    const errors = validationResult(req)
    let error_results
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
      let meeting = await StatusLog.getLeadMeetings(req.body._id)
      return res.render('lead_edit', {
        LEAD_STATUS,
        OUTCOME,
        meeting,
        lead: req.body,
        errors: error_results,
      })
    }
    next()
  },
]

exports.validateLeadStatusEdit = [
  check('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required.')
    .bail()
    .custom((status) => {
      let arrLeadStatus = Object.values(LEAD_STATUS)
      if (!arrLeadStatus.includes(status)) {
        throw new Error('Status invalid.')
      } else {
        return true
      }
    })
    .bail(),
  check('note').trim().notEmpty().withMessage('Note is required.').bail(),
  check('date')
    .trim()
    .custom((value, { req }) => {
      if (meetingParamsUndefined(req.body, value)) {
        throw new Error('Date is required.')
      } else return true
    })
    .bail(),
  check('time')
    .trim()
    .custom((value, { req }) => {
      if (meetingParamsUndefined(req.body, value)) {
        throw new Error('Time is required.')
      } else return true
    })
    .bail(),
  check('address')
    .trim()
    .custom((value, { req }) => {
      if (meetingParamsUndefined(req.body, value)) {
        throw new Error('Address is required.')
      } else return true
    })
    .bail(),
  check('product')
    .trim()
    .custom((value, { req }) => {
      if (clientParamsUndefined(req.body, value)) {
        throw new Error('Product is required.')
      } else return true
    })
    .bail(),
  check('program')
    .trim()
    .custom((value, { req }) => {
      if (clientParamsUndefined(req.body, value)) {
        throw new Error('Program is required.')
      } else return true
    })
    .bail(),
  async function (req, res, next) {
    const errors = validationResult(req)
    let error_results
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
      let meeting = await StatusLog.getLeadMeetings(req.body._id)
      return res.render('lead_edit', {
        LEAD_STATUS,
        OUTCOME,
        meeting,
        lead: req.body,
        errors: error_results,
      })
    }
    next()
  },
]

exports.validateMeetingOutcome = [
  check('outcome')
    .trim()
    .notEmpty()
    .withMessage('Outcome is required.')
    .bail()
    .custom((outcome) => {
      let arrLeadStatus = Object.values(OUTCOME)
      if (!arrLeadStatus.includes(outcome)) {
        throw new Error('Outcome invalid.')
      } else {
        return true
      }
    })
    .bail(),
  check('outcome_note')
    .trim()
    .notEmpty()
    .withMessage('Outcome Note is required.')
    .bail(),
  // check('product')
  //   .trim()
  //   .custom((value, { req }) => {
  //     if (clientParamsUndefined(req.body, value)) {
  //       throw new Error('Product is required.')
  //     } else return true
  //   })
  //   .bail(),
  // check('program')
  //   .trim()
  //   .custom((value, { req }) => {
  //     if (clientParamsUndefined(req.body, value)) {
  //       throw new Error('Program is required.')
  //     } else return true
  //   })
  //   .bail(),
  async function (req, res, next) {
    const errors = validationResult(req)
    let error_results
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
      let meeting = await StatusLog.getLeadMeetings(req.body._id)
      return res.render('lead_edit', {
        LEAD_STATUS,
        OUTCOME,
        meeting,
        lead: req.body,
        errors: error_results,
      })
    }
    next()
  },
]

const meetingParamsUndefined = (body, value) => {
  //check if status meeting
  if (body.status == LEAD_STATUS.MEETING) {
    //check if validating value is undefined
    if (value == '' || value === undefined) {
      return true
    }
  } else false
}

const clientParamsUndefined = (body, value) => {
  //check if status meeting
  if (body.status == LEAD_STATUS.CLIENT) {
    //check if validating value is undefined
    if (value == '' || value === undefined) {
      return true
    }
  } else false
}
