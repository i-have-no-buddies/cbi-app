const { LEAD_STATUS } = require('../../model/Lead')
const { User } = require('../../model/User')
const { check, validationResult } = require('express-validator')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
const { errorFormater } = require('../../utils/helper.js')

exports.validateLeadAddwithMeeting = [
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
    .custom((value, {req}) => {
      if(req.body.business_no == '' && req.body.mobile == '' && req.body.second_mobile == '') {
        throw new Error('Atleast 1 Contact is required')
      } else if (req.body.business_no == '') {
        return true
      }
      try {
        number = phoneUtil.parse(`+${value}`, '');
        let is_valid = phoneUtil.isPossibleNumber(number);
        let is_valid2 = phoneUtil.isValidNumber(number);
        if(is_valid && is_valid2) return true
        else throw new Error('Business No Invalid')
      } catch (e) {
        throw new Error('Business No Invalid')
      }
    })
    .bail(),
  check('mobile')
    .custom((value, {req}) => {
      if(req.body.business_no == '' && req.body.mobile == '' && req.body.second_mobile == '') {
        return true
        //throw new Error('Atleast 1 Contact is required')
      } else if (req.body.mobile == '') {
        return true
      }
      try {
        number = phoneUtil.parse(`+${value}`, '');
        let is_valid = phoneUtil.isPossibleNumber(number);
        let is_valid2 = phoneUtil.isValidNumber(number);
        if(is_valid && is_valid2) return true
        else throw new Error('Mobile Invalid')
      } catch (e) {
        throw new Error('Mobile Invalid')
      }
    })
    .bail(),
  check('second_mobile')
    .custom((value, {req}) => {
      if(req.body.business_no == '' && req.body.mobile == '' && req.body.second_mobile == '') {
        return true
        //throw new Error('Atleast 1 Contact is required')
      } else if (req.body.second_mobile == '') {
        return true
      }
      try {
        number = phoneUtil.parse(`+${value}`, '');
        let is_valid = phoneUtil.isPossibleNumber(number);
        let is_valid2 = phoneUtil.isValidNumber(number);
        if(is_valid && is_valid2) return true
        else throw new Error('Second Mobile Invalid')
      } catch (e) {
        throw new Error('Second Mobile Invalid')
      }
    })
    .bail(),
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
  check('note')
    .trim()
    .notEmpty()
    .withMessage('Note is required.')
    .bail(),
  check('datetime')
    .trim()
    .notEmpty()
    .withMessage('Datetime is required.')
    .bail(),
  check('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .bail(),
  check('allocated_to')
    .custom(async (value) => {
      if(!value) throw new Error('Allocated To is required.')
      let data = await User.findById(value)
      if(!data) throw new Error('Allocated To Invalid.')
    })
    .bail(),
    async function  (req, res, next) {
    const errors = validationResult(req)
    const ifas = await User.getAllUsers().lean();
    let error_results
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
      return res.render('lead_management_add', {
        lead: req.body,
        IFA: ifas,
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
    .custom((value, {req}) => {
      if(req.body.business_no == '' && req.body.mobile == '' && req.body.second_mobile == '') {
        throw new Error('Atleast 1 Contact is required')
      } else if (req.body.business_no == '') {
        return true
      }
      try {
        number = phoneUtil.parse(`+${value}`, '');
        let is_valid = phoneUtil.isPossibleNumber(number);
        let is_valid2 = phoneUtil.isValidNumber(number);
        if(is_valid && is_valid2) return true
        else throw new Error('Business No Invalid')
      } catch (e) {
        throw new Error('Business No Invalid')
      }
    })
    .bail(),
  check('mobile')
    .custom((value, {req}) => {
      if(req.body.business_no == '' && req.body.mobile == '' && req.body.second_mobile == '') {
        return true
        //throw new Error('Atleast 1 Contact is required')
      } else if (req.body.mobile == '') {
        return true
      }
      try {
        number = phoneUtil.parse(`+${value}`, '');
        let is_valid = phoneUtil.isPossibleNumber(number);
        let is_valid2 = phoneUtil.isValidNumber(number);
        if(is_valid && is_valid2) return true
        else throw new Error('Mobile Invalid')
      } catch (e) {
        throw new Error('Mobile Invalid')
      }
    })
    .bail(),
  check('second_mobile')
    .custom((value, {req}) => {
      if(req.body.business_no == '' && req.body.mobile == '' && req.body.second_mobile == '') {
        return true
        //throw new Error('Atleast 1 Contact is required')
      } else if (req.body.second_mobile == '') {
        return true
      }
      try {
        number = phoneUtil.parse(`+${value}`, '');
        let is_valid = phoneUtil.isPossibleNumber(number);
        let is_valid2 = phoneUtil.isValidNumber(number);
        if(is_valid && is_valid2) return true
        else throw new Error('Second Mobile Invalid')
      } catch (e) {
        throw new Error('Second Mobile Invalid')
      }
    })
    .bail(),
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
  function (req, res, next) {
    const errors = validationResult(req)
    let error_results
    if (!errors.isEmpty()) {
      error_results = errorFormater(errors)
      return res.render('lead_management_edit', {
        LEAD_STATUS,
        lead: req.body,
        errors: error_results,
      })
    }
    next()
  },
]
