const { BdmSetting } = require('../model/BdmSetting');

exports.index = async (req, res) => {
  const settings = await BdmSetting.find({}).select('_id name').lean();
  let setting;
  if (settings) {
    setting = await BdmSetting.findById(settings[0]._id).lean();
  }
  return res.render('bdm', { settings, setting });
};
