const {
  User,
  PHONE_REGEX,
  USER_TYPE,
  USER_STATUS,
} = require('../../model/User');
const { check, validationResult } = require('express-validator');

exports.validateUserAdd = [
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
  check('phone_number')
    .optional({ checkFalsy: true })
    .bail()
    .trim()
    .custom((phone_number) => {
      if (!phone_number.match(PHONE_REGEX)) {
        throw new Error(
          'Phone should be numbers only with minimum length of 7 and maximum length of 20'
        );
      }
      return true;
    })
    .bail(),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Email is invalid.')
    .bail()
    .custom((email) => {
      return User.findOne({ email }).then((user) => {
        if (user) {
          return Promise.reject('Email is already taken.');
        }
      });
    })
    .bail(),
  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.')
    .bail()
    .isLength({ min: 10 })
    .withMessage('Password must be minimum of 10 characters.')
    .bail(),
  check('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required.')
    .bail()
    .custom((type) => {
      let arrUserType = Object.values(USER_TYPE);
      if (!arrUserType.includes(type)) {
        throw new Error('Type invalid.');
      }
      return true;
    })
    .bail(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error_results = {};
      for (let i = 0; i < errors.array().length; i++) {
        error_results[errors.errors[i].param] = errors.errors[i].msg;
      }
      return res.render('user_maintenance_add', {
        USER_TYPE,
        user: req.body,
        errors: error_results,
      });
    }
    next();
  },
];

exports.validateUserEdit = [
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
  check('phone_number')
    .optional({ checkFalsy: true })
    .bail()
    .trim()
    .custom((phone_number) => {
      if (!phone_number.match(PHONE_REGEX)) {
        throw new Error(
          'Phone should be numbers only with minimum length of 7 and maximum length of 20'
        );
      }
      return true;
    })
    .bail(),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Email is invalid.')
    .bail()
    .custom((email, { req }) => {
      return User.findOne({ email, _id: { $ne: req.body._id } }).then(
        (user) => {
          if (user) {
            return Promise.reject('Email is already taken.');
          }
        }
      );
    })
    .bail(),
  check('password')
    .trim()
    .optional({ checkFalsy: true })
    .bail()
    .isLength({ min: 10 })
    .withMessage('Password must be minimum of 10 characters.')
    .bail(),
  check('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required.')
    .bail()
    .custom((type) => {
      let arrUserType = Object.values(USER_TYPE);
      if (!arrUserType.includes(type)) {
        throw new Error('Type invalid.');
      }
      return true;
    })
    .bail(),
  check('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required.')
    .bail()
    .custom((status) => {
      let arrUserStatus = Object.values(USER_STATUS);
      if (!arrUserStatus.includes(status)) {
        throw new Error('Status invalid.');
      }
      return true;
    })
    .bail(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error_results = {};
      for (let i = 0; i < errors.array().length; i++) {
        error_results[errors.errors[i].param] = errors.errors[i].msg;
      }
      return res.render('user_maintenance_edit', {
        USER_TYPE,
        USER_STATUS,
        user: req.body,
        errors: error_results,
      });
    }
    next();
  },
];
