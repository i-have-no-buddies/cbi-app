const { BdmSetting } = require('../model/BdmSetting');
const { Lead } = require('../model/Lead');

exports.index = async (req, res) => {
  try {
    const settings = await BdmSetting.find({}).select('_id name').lean();
    let setting = [];
    let leads = [];
    if (settings) {
      setting = await BdmSetting.findById(settings[0]._id).lean();
      leads = await Lead.find({}).lean();
    }
    return res.render('bdm', { settings, setting, leads });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
