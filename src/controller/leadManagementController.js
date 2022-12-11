const { LeadBatch } = require('../model/LeadBatch');
const { Lead, LEAD_STATUS } = require('../model/Lead');
const {
  ngramsAlgo,
  tagsSearchFormater,
  queryParamReturner,
} = require('../utils/helper');
const { fork } = require('child_process');
const { ObjectId } = require('mongodb');
const LEAD_PER_PAGE = 10;
const BATCH_PER_PAGE = 9;

exports.index = async (req, res) => {
  try {
    var list;
    const page = req.query.page || 1;
    const type = req.query.type || 'lead';
    const search_tags = ['name', 'job_title', 'company', 'status'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const return_search = ['name', 'job_title', 'company', 'status', 'batch'];
    const query_params = await queryParamReturner(return_search, req.query);
    if (req.query.batch) {
      search['lead_batch_id'] = ObjectId(req.query.batch);
    }
    if (type == 'lead') {
      list = await Lead.paginate(search, {
        lean: true,
        page,
        limit: LEAD_PER_PAGE,
      });
    } else {
      list = await LeadBatch.paginate(search, {
        lean: true,
        page,
        limit: BATCH_PER_PAGE,
      });
    }
    return res.render('lead_management', {
      list,
      type: type,
      search: query_params,
      LEAD_STATUS,
    });
  } catch (error) {
    console.error(error);
    return res.render(500);
  }
};

exports.upload = (req, res) => {
  try {
    return res.render('lead_management_upload');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.new_upload = async (req, res) => {
  try {
    var lead_batch = new LeadBatch();
    lead_batch.upload_name = req.body.upload_name;
    lead_batch.file_location = req.file.filename;
    lead_batch.created_by = req.session.AUTH._id;
    lead_batch.tags = ngramsAlgo(
      req.body.upload_name.toLowerCase().trim(),
      'tag'
    );
    await lead_batch.save();

    //or make it a function here?
    const childProcess = fork('./src/childProcess/uploadLeads.js');
    childProcess.send({ upload: lead_batch, user_id: req.session.AUTH._id });

    res.redirect('/lead-management');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.add = (req, res) => {
  try {
    return res.render('lead_management_add');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.create = async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      created_by: req.session.AUTH._id,
    });
    await lead.save();
    return res.redirect('/lead-management');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const lead = await Lead.findById(id).lean();
    return res.render('lead_management_edit', {
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
      if (property !== '_id') {
        lead[property] = req.body[property];
      }
    }
    await lead.save();
    return res.redirect('/lead-management');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
