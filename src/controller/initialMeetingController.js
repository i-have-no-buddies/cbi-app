const { ObjectId } = require('mongodb');
const moment = require('moment-timezone')

const { Lead, HIERARCHY, LEAD_STATUS } = require('../model/Lead');
const { StatusLog } = require('../model/StatusLog');
const { LeadUpdateLog } = require('../model/LeadUpdateLog');
const { tagsSearchFormater, queryParamReturner, arrayChunks } = require('../utils/helper');
const LEAD_PER_PAGE = 10;
const date_format = 'YYYY-MM-DD hh:ii A'
const time_format = 'YYMMDDhhA'

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'company', 'job_title'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    search['hierarchy'] = HIERARCHY.NEW;
    search['allocated_to'] = ObjectId(req.session.AUTH._id);

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

exports.edit = async (req, res) => {
  try {
    const id = req.params.id
    var lead = await Lead.findById(id).lean()
    const meeting = await StatusLog.getLeadMeetings(id)
    const lead_logs = await LeadUpdateLog.getUpdateLogs(id)
    const update_logs = arrayChunks(lead_logs)

    return res.render('initial_meeting_edit', {
      lead,
      meeting,
      update_logs,
    })
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findById(req.body._id)
    for (const property in req.body) {
      //not date,time,note,status
      if (property !== '_id') {
        lead[property] = req.body[property]
      }
    }
    
    lead.updated_at = new Date();
    lead.updated_by = req.session.AUTH._id;
    await lead.save()
    return res.redirect('/initial-meeting')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.update_status = async (req, res) => {
  try {
    const status_log = new StatusLog()
    status_log.lead_id = req.body._id
    status_log.note = req.body.note
    status_log.status_log = req.body.status_log

    if (req.body.status_log == LEAD_STATUS.MEETING) {
      let datetime = moment(`${req.body.datetime}`, date_format);
      status_log.datetime = datetime;
      status_log.meeting_time = datetime.format(time_format);
      status_log.address = req.body.address;
    }
    
    status_log.updated_at = new Date();
    status_log.updated_by = req.session.AUTH._id;
    await status_log.save()

    //this is wrong because it create another log
    const lead = await Lead.findById(req.body._id)
    lead.status = req.body.status_log
    lead.updated_at = new Date();
    lead.updated_by = req.session.AUTH._id;
    await lead.save()

    return res.redirect('/initial-meeting')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.meeting_update = async (req, res) => {
  try {
    const status_log = await StatusLog.findById(req.body.meeting_id);
    status_log.is_first_meeting = req.body.is_first_meeting;
    status_log.outcome = req.body.outcome;
    status_log.outcome_note = req.body.outcome_note;
    status_log.outcome_date = new Date();
    status_log.updated_at = new Date();
    status_log.updated_by = req.session.AUTH._id;
    await status_log.save();

    const lead = await Lead.findById(req.body._id)
    if(status_log.is_first_meeting == true) {
      if(lead.hierarchy == HIERARCHY.NEW) {
        lead.first_meeting = new Date()
        lead.status = LEAD_STATUS.FIRST_MEETING
        lead.hierarchy = HIERARCHY.FIRST_MEETING
        await lead.save()
      }
    }

    return res.redirect('/initial-meeting')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}