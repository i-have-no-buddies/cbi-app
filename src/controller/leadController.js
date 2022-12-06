const { Lead, LEAD_STATUS } = require('../model/Lead');
const {
  ngramsAlgov2,
  tagsSearchFormater,
  queryParamReturner,
} = require('../utils/helper');
const LEAD_PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;

    let search_tags = ['name', 'job_title', 'company', 'status'];
    var search = await tagsSearchFormater(search_tags, req.query);
    var query_params = await queryParamReturner(search_tags, req.query);

    const list = await Lead.paginate(search, {
      lean: true,
      page,
      limit: LEAD_PER_PAGE,
    });

    return res.render('lead', {
      list,
      search: query_params,
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render(500);
  }
};

// exports.add = (req, res) => {
//   try {
//     return res.render('lead_add', { navigation });
//   } catch (error) {
//     console.error(error);
//     return res.render('500');
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const lead = new Lead({
//       ...req.body,
//       created_by: req.session.AUTH._id
//     });
//     await lead.save();
//     return res.redirect('/lead');
//   } catch (error) {
//     console.error(error);
//     return res.render('500');
//   }
// };

exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const lead = await Lead.findById(id).lean();
    return res.render('lead_edit', {
      lead,
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findById(req.body._id);
    for (const property in req.body) {
      //not date,time,note,status
      if (property !== '_id') {
        lead[property] = req.body[property];
      }
    }
    await lead.save();
    return res.redirect('/lead');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update_status = async (req, res) => {
  try {
    // const lead = await Lead.findById(req.body._id);
    // for (const property in req.body) {
    //   if (property !== '_id') {
    //     lead[property] = req.body[property];
    //   }
    // }
    // await lead.save();
    return res.redirect('/lead');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
