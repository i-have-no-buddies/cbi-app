const { Lead } = require('../model/Lead');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const LEAD_PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'company', 'job_title'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const leads = await Lead.paginate(search, {
      lean: true,
      page,
      limit: LEAD_PER_PAGE,
    });
    return res.render('initial_meeting', {
      leads,
      search: query_params,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
