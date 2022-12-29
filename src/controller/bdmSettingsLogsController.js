const { BdmSettingLog } = require('../model/BdmSettingLog');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const PER_PAGE = 9;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['_id', 'name', 'ifa', 'bdm'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const bdm_settings_logs = await BdmSettingLog.paginate(search, {
      page,
      limit: PER_PAGE,
      lean: true,
      sort: { _id: -1 },
    });
    return res.render('bdm_settings_logs', {
      bdm_settings_logs,
      search: query_params,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.details = async (req, res) => {
  try {
    const bdm_settings_log = await BdmSettingLog.findById(
      req.params._id
    ).lean();
    return res.render('bdm_settings_logs_details', { bdm_settings_log });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
