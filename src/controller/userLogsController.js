const { UserLog } = require('../model/UserLog');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const PER_PAGE = 9;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['_id'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const user_logs = await UserLog.paginate(search, {
      page,
      limit: PER_PAGE,
      lean: true,
      sort: { _id: -1 },
    });
    return res.render('user_logs', { user_logs, search: query_params });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.details = async (req, res) => {
  try {
    const user_log = await UserLog.findById(req.params._id).lean();
    return res.render('user_logs_details', { user_log });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
