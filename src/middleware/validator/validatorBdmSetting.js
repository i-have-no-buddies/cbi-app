const { BdmSetting } = require('../../model/BdmSetting');
const { User } = require('../../model/User');
const { LEAD_STATUS } = require('../../model/Lead');
const { check, validationResult } = require('express-validator');

exports.validateBdmSettingAdd = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('First name must be minimum of 2 characters.')
    .bail(),
  check('ifa')
    .trim()
    .notEmpty()
    .withMessage('IFA is required.')
    .bail()
    .custom(async (ifa) => {
      const ifas = await User.getActiveIfa().lean();
      const ifaExists = ifas.filter((row) => {
        return ifa === row._id;
      });
      if (!ifaExists) {
        throw new Error('IFA invalid.');
      } else {
        return true;
      }
    })
    .bail(),
  check('bdm')
    .trim()
    .notEmpty()
    .withMessage('BDM is required.')
    .bail()
    .custom(async (bdm) => {
      const bdms = await User.getActiveIfa().lean();
      const bdmExists = bdms.filter((row) => {
        return bdm === row._id;
      });
      if (!bdmExists) {
        throw new Error('BDM invalid.');
      } else {
        return true;
      }
    })
    .bail(),
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
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error_results = {};
      for (let i = 0; i < errors.array().length; i++) {
        error_results[errors.errors[i].param] = errors.errors[i].msg;
      }
      const bdms = await User.getActiveBdm().lean();
      const managers = await User.getActiveManager().lean();
      const ifas = await User.getActiveIfa().lean();
      return res.render('bdm_settings_add', {
        BDM: bdms,
        IFA: [...managers, ...ifas],
        LEAD_STATUS,
        body: req.body,
        errors: error_results,
      });
    }
    next();
  },
];

exports.validateBdmSettingEdit = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .bail()
    .isLength({ min: 2 })
    .withMessage('First name must be minimum of 2 characters.')
    .bail(),
  check('ifa')
    .trim()
    .notEmpty()
    .withMessage('IFA is required.')
    .bail()
    .custom(async (ifa) => {
      const ifas = await User.getActiveIfa().lean();
      const ifaExists = ifas.filter((row) => {
        return ifa === row._id;
      });
      if (!ifaExists) {
        throw new Error('IFA invalid.');
      } else {
        return true;
      }
    })
    .bail(),
  check('bdm')
    .trim()
    .notEmpty()
    .withMessage('BDM is required.')
    .bail()
    .custom(async (bdm) => {
      const bdms = await User.getActiveIfa().lean();
      const bdmExists = bdms.filter((row) => {
        return bdm === row._id;
      });
      if (!bdmExists) {
        throw new Error('BDM invalid.');
      } else {
        return true;
      }
    })
    .bail(),
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
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error_results = {};
      for (let i = 0; i < errors.array().length; i++) {
        error_results[errors.errors[i].param] = errors.errors[i].msg;
      }
      const bdms = await User.getActiveBdm().lean();
      const managers = await User.getActiveManager().lean();
      const ifas = await User.getActiveIfa().lean();
      return res.render('bdm_settings_edit', {
        BDM: bdms,
        IFA: [...managers, ...ifas],
        LEAD_STATUS,
        setting: req.body,
        errors: error_results,
      });
    }
    next();
  },
];
