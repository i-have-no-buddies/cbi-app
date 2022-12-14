const { UserLogin } = require('../model/UserLogin');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['_id', 'first_name', 'last_name', 'type', 'login'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const user_logins = await UserLogin.paginate(search, {
      page,
      limt: PER_PAGE,
      lean: true,
      sort: { _id: -1 },
    });
    return res.render('user_login', {
      user_logins,
      search: query_params,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
