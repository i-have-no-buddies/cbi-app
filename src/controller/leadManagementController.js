const { ObjectId } = require('mongodb');
const fs = require('fs');
const csv = require('@fast-csv/parse');
const { fork } = require('child_process');

const { LeadBatch, UPLOAD_STATUS, FILE_HEADERS } = require('../model/LeadBatch');
const { Lead, LEAD_STATUS, HIERARCHY } = require('../model/Lead');
const { User } = require('../model/User');
const {
  ngramsAlgo,
  tagsSearchFormater,
  queryParamReturner,
  validateUpload,
  errorFormaterCSV
} = require('../utils/helper');

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
        sort: { _id: -1 },
      });
    } else {
      list = await LeadBatch.paginate(search, {
        lean: true,
        page,
        limit: BATCH_PER_PAGE,
        sort: { _id: -1 },
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
    let {upload_name} = req.body;
    var lead_batch = new LeadBatch();
    lead_batch.upload_name = upload_name;
    lead_batch.file_location = req.file.filename;
    lead_batch.created_by = req.session.AUTH._id;
    lead_batch.tags = ngramsAlgo(upload_name.toLowerCase().trim(), 'tag');
    await lead_batch.save();

    //or make it a function here?
    // const childProcess = fork('./src/childProcess/uploadLeads.js');
    // childProcess.send({ upload: lead_batch, user_id: req.session.AUTH._id });
    
    var all_users = await User.find({},{email: 1, _id: 1}).lean();
    var leads = []
    var invalid_leads = []
    let uploaded_count = 0;
    let invalid_count = 0;
    const stream = fs.createReadStream(`./public/uploads/${req.file.filename}`);
    csv
      .parseStream(stream, { headers: true, ignoreEmpty: true })
      .on('error', (error) => console.error(error))
      .on('data', async (row) => {
        //append datas needed
        row.lead_batch_id = lead_batch._id;
        row.created_by = req.session.AUTH._id;
        row.updated_by = req.session.AUTH._id;
        
        row.business_no = row.business_no.replace('`', '').replace('"', '').replace("'", '')
        row.mobile = row.mobile.replace('`', '').replace('"', '').replace("'", '')
        row.second_mobile = row.second_mobile.replace('`', '').replace('"', '').replace("'", '')
        
        //will be used in creating initial meeting
        row.uploaded_meeting = {
          created_by: req.session.AUTH._id,
          updated_by: req.session.AUTH._id,
          status_log: LEAD_STATUS.MEETING,
          note: row.meeting_note,
          meeting_date: row.meeting_date,
          meeting_time: row.meeting_time,
          address: row.meeting_note
        };

        //validation
        let allocated_to = all_users.find(o => o.email === row.ifa_email);
        let errors = await validateUpload({body: row});
        let valid = errors.isEmpty()? true : false;
        
        if(valid && allocated_to != null) {
          row.allocated_to = allocated_to._id;
          row.status = LEAD_STATUS.NEW;
          row.hierarchy = HIERARCHY.NEW;
          leads.push(row);
          uploaded_count++;
        }
        else {
          //append the errors?
          row['invalid'] = await errorFormaterCSV(errors)
          invalid_leads.push(row);
          invalid_count++;
        }

        if (leads.length == 500) {
          await Lead.insertMany(leads, { ordered: false });
          leads = [];
        }
      })
      .on('end', async (rowCount) => {
        if (leads.length > 0) {
          await Lead.insertMany(leads, { ordered: false });
        }
        lead_batch.status = UPLOAD_STATUS.ACTIVE;
        lead_batch.uploaded = uploaded_count;
        lead_batch.invalid = invalid_count;
        await lead_batch.save();

        const childProcess = fork('./src/childProcess/uploadedLeadMeeting.js');
        childProcess.send({ lead_batch: lead_batch });

        //data has invalid return datas
        if(invalid_count != 0) {
          let fields = FILE_HEADERS
          fields = [...fields, 'invalid']
          res.setHeader('Content-Disposition', `attachment; filename=${upload_name}-invalid.csv`);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Location', '/lead-management');
          res.write(fields.join(',') + '\n');
          invalid_leads.forEach(element => {
            let content = [];
            for (const property of fields) {
              if (element.hasOwnProperty(property)) {
                if (element[property].replace(/ /g, '').match(/[\s,"]/)) {
                  element[property] =  '"' + element[property].replace(/"/g, '""') + '"';
                }
                content.push(element[property]);
              }
            } 
            res.write(content.join(',') + '\n');
          });
          res.end();
        } else {
          return res.redirect('/lead-management');
        }
      })

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
