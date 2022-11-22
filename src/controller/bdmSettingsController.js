const { BdmSetting } = require('../model/BdmSetting');
const { User } = require('../model/User');
const { LEAD_STATUS } = require('../model/Lead');
const PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search = {};
    if (req.query.search) {
      search['tags.tag'] = req.query.search.toLowerCase().trim();
    }
    const settings = await BdmSetting.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    });
    return res.render('bdm_settings', {
      settings,
      search: req.query.search || '',
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.add = async (req, res) => {
  try {
    const bdms = await User.getActiveBdm().lean();
    const managers = await User.getActiveManager().lean();
    const ifas = await User.getActiveIfa().lean();
    return res.render('bdm_settings_add', {
      BDM: bdms,
      IFA: [...managers, ...ifas],
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.create = async (req, res) => {
  try {
    const bdmSetting = new BdmSetting(req.body);
    await bdmSetting.save();
    return res.redirect('/bdm-settings');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.edit = async (req, res) => {
  try {
    const setting = await BdmSetting.findOne({ _id: req.params.id }).lean();
    const bdms = await User.getActiveBdm().lean();
    const managers = await User.getActiveManager().lean();
    const ifas = await User.getActiveIfa().lean();
    return res.render('bdm_settings_edit', {
      setting,
      BDM: bdms,
      IFA: [...managers, ...ifas],
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update = async (req, res) => {
  try {
    const setting = await BdmSetting.findById(req.body._id);
    for (const property in req.body) {
      if (property !== '_id') {
        setting[property] = req.body[property];
      }
    }
    await setting.save();
    return res.redirect('/bdm-settings');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
