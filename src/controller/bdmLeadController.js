const { BdmSetting } = require('../model/BdmSetting');
const { Lead } = require('../model/Lead');
const PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    let settings = [];
    let setting;
    let leads;
    settings = await BdmSetting.find({}).select('_id name').lean();
    if (!settings.length) {
      res.locals.CURRENT_BDM_SETTING = '';
      return res.render('bdm_lead', {
        leads: { page: 1, totalPages: 0, totalDocs: 0 },
      });
    }
    if (!req.query.setting) {
      res.locals.CURRENT_BDM_SETTING = settings[0]._id;
      return res.redirect(`/bdm-lead?setting=${settings[0]._id}&page=1`);
    }
    setting = await BdmSetting.findById(req.query.setting).lean();
    const page = req.query.page || 1;
    const search = {};
    leads = await Lead.paginate(search, {
      page,
      limit: PER_PAGE,
      lean: true,
    });
    res.locals.CURRENT_BDM_SETTING = setting._id.toString();
    return res.render('bdm_lead', { settings, setting, leads });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.details = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean();
    return res.render('bdm_lead_details', { lead });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
