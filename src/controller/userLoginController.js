const { UserLogin, LOGIN_TYPE } = require('../model/UserLogin');
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper');
const PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'type'];
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
      LOGIN_TYPE,
      search: query_params,
    });
  } catch (error) {
    console.log(error);
    return res.render('500');
  }
};
