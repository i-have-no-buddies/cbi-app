const { Lead, LEAD_STATUS } = require('../model/Lead');
const { ngramsAlgo } = require('../utils/helper');
const LEAD_PER_PAGE = 10;

exports.index = async (req, res) => {
  try {
    var list
    const page = req.query.page || 1;
    var search = {};
    let tag_search = [];
    if (req.query.search) {
      tag_search.push({ 'tags.tag': req.query.search.toLowerCase().trim() });
    }
    if (req.query.job) {
      tag_search.push({ 'tags.tag': req.query.job.toLowerCase().trim() });
    }
    if (req.query.company) {
      tag_search.push({ 'tags.tag': req.query.company.toLowerCase().trim() });
    }
    if (tag_search.length) {
      search = { $and: tag_search };
    } else {
      search = {};
    }
  
    list = await Lead.paginate(search, {
      lean: true,
      page,
      limit: LEAD_PER_PAGE,
    });

    return res.render('lead', {
      list,
      search: {
        search: req.query.search || '',
        job: req.query.job || '',
        company: req.query.company || '',
        status: req.query.status || '',
      },
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render(500);
  }
}


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
