const moment = require('moment-timezone')
const { ObjectId } = require('mongodb')
const server = require('../server')

const { Lead, LEAD_STATUS, OUTCOME, HIERARCHY } = require('../model/Lead')
const { StatusLog } = require('../model/StatusLog')
const { LeadUpdateLog } = require('../model/LeadUpdateLog')
const { tagsSearchFormater, queryParamReturner,arrayChunks} = require('../utils/helper')

const LEAD_PER_PAGE = 10
const date_format = 'YYYY-MM-DD hh:mm A'
const time_format = 'YYMMDDhhA'

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'email', 'contact', 'company', 'job_title', 'product', 'hierarchy', 'status', 'upload_date'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    search['hierarchy'] = {'$in': [HIERARCHY.FIRST_MEETING, HIERARCHY.SECOND_MEETING, HIERARCHY.CLIENT]};
    search['allocated_to'] = ObjectId(req.session.AUTH._id);

    
    const list = await Lead.paginate(search, {
      lean: true,
      page,
      limit: LEAD_PER_PAGE,
    });
    return res.render('lead', {
      list,
      search: query_params,
    })
  } catch (error) {
    console.error(error)
    return res.render(500)
  }
}

exports.edit = async (req, res) => {
  try {
    const id = req.params.id
    var lead = await Lead.findById(id).lean()
    const meeting = await StatusLog.getLeadMeetings(id)
    const lead_logs = await LeadUpdateLog.getUpdateLogs(id)
    const update_logs = arrayChunks(lead_logs)

    return res.render('lead_edit', {
      lead,
      meeting,
      update_logs,
      OUTCOME,
    })
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.details = async (req, res) => {
  try {
    const lead_update_log = await LeadUpdateLog.findById(req.params._id).lean();
    return res.render('lead_edit_details', { lead_update_log });
  } catch (error) {
    console.error(error);
    return res.render('500');
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
    lead.action_page = req.route.path;
    await lead.save()
    
    if (server.emitter) {
      server.emitter.emit('reloadEvent', {
        page: '/lead',
        _id: req.session.AUTH._id.toString(),
      });
      server.emitter.emit('reloadEvent', {
        page: '/calendar',
        _id: req.session.AUTH._id.toString(),
      });
    }

    return res.redirect(`/lead/edit/${req.body._id}`)
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
      status_log.outcome = 'NEW';
      status_log.datetime = datetime;
      status_log.meeting_time = datetime.format(time_format);
      status_log.address = req.body.address;
    }
    if (req.body.status_log == LEAD_STATUS.CLIENT) {
      status_log.product = req.body.product
      status_log.program = req.body.program
    }
    
    status_log.updated_at = new Date();
    status_log.updated_by = req.session.AUTH._id;
    status_log.created_by = req.session.AUTH._id;
    status_log.action_page = req.route.path;
    await status_log.save()


    if (server.emitter) {
      server.emitter.emit('reloadEvent', {
        page: '/lead',
        _id: req.session.AUTH._id.toString(),
      });
      server.emitter.emit('reloadEvent', {
        page: '/calendar',
        _id: req.session.AUTH._id.toString(),
      });
    }

    return res.redirect(`/lead/edit/${req.body._id}`)
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.meeting_update = async (req, res) => {
  try {
    const status_log = await StatusLog.findById(req.body.meeting_id);
    status_log.is_second_meeting = req.body.is_second_meeting;
    status_log.outcome = req.body.outcome;
    status_log.outcome_note = req.body.outcome_note;
    status_log.outcome_date = new Date();
    status_log.updated_at = new Date();
    status_log.updated_by = req.session.AUTH._id;
    status_log.action_page = req.route.path;
    await status_log.save()
    
    if (server.emitter) {
      server.emitter.emit('reloadEvent', {
        page: '/lead',
        _id: req.session.AUTH._id.toString(),
      });
      server.emitter.emit('reloadEvent', {
        page: '/calendar',
        _id: req.session.AUTH._id.toString(),
      });
    }
    
    //return res.redirect('/lead')
    return res.redirect(`/lead/edit/${req.body._id}`)
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}
