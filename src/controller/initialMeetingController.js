const { ObjectId } = require('mongodb');
const moment = require('moment-timezone');
const server = require('../server');

const { Lead, HIERARCHY, LEAD_STATUS } = require('../model/Lead');
const { StatusLog } = require('../model/StatusLog');
const { LeadUpdateLog } = require('../model/LeadUpdateLog');
const {
  tagsSearchFormater,
  queryParamReturner,
  arrayChunks,
} = require('../utils/helper');
const LEAD_PER_PAGE = 10;
const date_format = 'YYYY-MM-DD hh:ii A';
const time_format = 'YYMMDDhhA';

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'email', 'contact', 'company', 'job_title'];
    const search = await tagsSearchFormater(search_tags, req.query);
    
    const return_search_tags = ['name', 'email', 'contact', 'company', 'job_title', 'meeting_date'];
    const query_params = await queryParamReturner(return_search_tags, req.query);
    search['hierarchy'] = HIERARCHY.NEW;
    search['allocated_to'] = ObjectId(req.session.AUTH._id);

    //get all meeting booked
    if(req.query.meeting_date) {
      let start_date = new moment(req.query.meeting_date + ' 00:00 AM', date_format);
      let end_date =  new moment(req.query.meeting_date + ' 11:59 PM', date_format);
      var meetings = await StatusLog.getCurrentMeetings(req.session.AUTH._id, start_date, end_date);
      if(meetings.length != 0) {
        let meeting_tag = meetings.map(x => ({'tags.tag': `[_id]${x.lead_id.toString()}`}))
        search['$or'] = meeting_tag;
      } else {
        search['$and'] = [{'tags.tag': 'empty'}];
      }
    }

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
    const id = req.params.id;
    var lead = await Lead.findById(id).lean();
    const meeting = await StatusLog.getLeadMeetings(id);
    const lead_logs = await LeadUpdateLog.getUpdateLogs(id);
    const update_logs = arrayChunks(lead_logs);

    return res.render('initial_meeting_edit', {
      lead,
      meeting,
      update_logs,
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

    lead.updated_at = new Date();
    lead.updated_by = req.session.AUTH._id;
    lead.action_page = req.route.path;
    await lead.save();
    if (server.emitter) {
      server.emitter.emit('reloadEvent', {
        page: '/initial-meeting',
        _id: req.session.AUTH._id.toString(),
      });
      server.emitter.emit('reloadEvent', {
        page: '/calendar',
        _id: req.session.AUTH._id.toString(),
      });
    }
    
    return res.redirect(`/initial-meeting/edit/${req.body._id}`);
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.update_status = async (req, res) => {
  try {
    const lead = await Lead.findById(req.body._id).lean();
    const status_log = new StatusLog();
    status_log.lead_id = req.body._id;
    status_log.lead = lead;
    status_log.note = req.body.note;
    status_log.status_log = req.body.status_log;

    if (req.body.status_log == LEAD_STATUS.MEETING) {
      let datetime = moment(`${req.body.datetime}`, date_format);
      status_log.outcome = 'NEW';
      status_log.datetime = datetime;
      status_log.meeting_time = datetime.format(time_format);
      status_log.address = req.body.address;
    }

    status_log.updated_at = new Date();
    status_log.updated_by = req.session.AUTH._id;
    status_log.created_by = req.session.AUTH._id;
    status_log.action_page = req.route.path;
    await status_log.save();

    if (server.emitter) {
      server.emitter.emit('reloadEvent', {
        page: '/initial-meeting',
        _id: req.session.AUTH._id.toString(),
      });
      server.emitter.emit('reloadEvent', {
        page: '/calendar',
        _id: req.session.AUTH._id.toString(),
      });
    }

    return res.redirect(`/initial-meeting/edit/${req.body._id}`);
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.meeting_update = async (req, res) => {
  try {
    const status_log = await StatusLog.findById(req.body.meeting_id);
    status_log.is_first_meeting = req.body.is_first_meeting;
    status_log.outcome = req.body.outcome;
    status_log.outcome_note = req.body.outcome_note;
    status_log.outcome_date = new Date();
    status_log.updated_at = new Date();
    status_log.updated_by = req.session.AUTH._id;
    status_log.action_page = req.route.path;
    await status_log.save();

    
    if (server.emitter) {
      server.emitter.emit('reloadEvent', {
        page: '/initial-meeting',
        _id: req.session.AUTH._id.toString(),
      });
      server.emitter.emit('reloadEvent', {
        page: '/calendar',
        _id: req.session.AUTH._id.toString(),
      });
    }
    
    return res.redirect(`/initial-meeting/edit/${req.body._id}`);
    //return res.redirect('/initial-meeting');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
