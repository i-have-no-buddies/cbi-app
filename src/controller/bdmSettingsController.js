const { BdmSetting } = require('../model/BdmSetting');
const { User } = require('../model/User');
const { LEAD_STATUS } = require('../model/Lead');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'ifa', 'bdm'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const settings = await BdmSetting.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    });
    const bdms = await User.getActiveBdm().lean();
    const ifas = await User.getActiveIfa().lean();
    return res.render('bdm_settings', {
      settings,
      search: query_params,
      BDM: bdms,
      IFA: ifas,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.add = async (req, res) => {
  try {
    const bdms = await User.getActiveBdm().lean();
    const ifas = await User.getActiveIfa().lean();
    return res.render('bdm_settings_add', {
      BDM: bdms,
      IFA: ifas,
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
    const setting = await BdmSetting.findOne({ _id: req.params._id }).lean();
    const bdms = await User.getActiveBdm().lean();
    const ifas = await User.getActiveIfa().lean();
    return res.render('bdm_settings_edit', {
      setting,
      BDM: bdms,
      IFA: ifas,
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update = async (req, res) => {
  try {
    const setting = await BdmSetting.findById(req.params._id);
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

exports.delete = async (req, res) => {
  try {
    await BdmSetting.deleteOne({ _id: req.params._id });
    return res.redirect('/bdm-settings');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
