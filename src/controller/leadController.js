const { STATES } = require('mongoose')
const moment = require('moment-timezone')

const { Lead, LEAD_STATUS, OUTCOME } = require('../model/Lead')
const { StatusLog } = require('../model/StatusLog')
const { tagsSearchFormater, queryParamReturner } = require('../utils/helper')

const LEAD_PER_PAGE = 10
const date_format = 'YYYY-MM-DD hh:mm A'

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search_tags = ['name', 'job_title', 'company', 'status'];
    const search = await tagsSearchFormater(search_tags, req.query);
    const query_params = await queryParamReturner(search_tags, req.query);
    const list = await Lead.paginate(search, {
      lean: true,
      page,
      limit: LEAD_PER_PAGE,
    });
    return res.render('lead', {
      list,
      search: query_params,
      LEAD_STATUS,
    })
  } catch (error) {
    console.error(error)
    return res.render(500)
  }
}

exports.edit = async (req, res) => {
  try {
    const id = req.params.id
    const lead = await Lead.findById(id).lean()
    const meeting = await StatusLog.getLeadMeetings(id)

    return res.render('lead_edit', {
      lead,
      meeting,
      LEAD_STATUS,
      OUTCOME,
    })
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findById(req.body._id)
    for (const property in req.body) {
      //not date,time,note,status
      if (property !== '_id') {
        lead[property] = req.body[property]
      }
    }
    await lead.save()
    return res.redirect('/lead')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.update_status = async (req, res) => {
  try {
    const status_log = new StatusLog()
    status_log.created_by = req.session.AUTH._id
    status_log.lead_id = req.body._id
    status_log.note = req.body.note
    status_log.status = req.body.status

    if (req.body.status == LEAD_STATUS.MEETING) {
      console.log(`${req.body.date} ${req.body.time}`)
      var date_time = moment(`${req.body.date} ${req.body.time}`, date_format)
      status_log.date_time = date_time
      status_log.address = req.body.address
    }
    await status_log.save()

    const lead = await Lead.findById(req.body._id)
    lead.status = req.body.status
    await lead.save()

    return res.redirect('/lead')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}

exports.meeting_update = async (req, res) => {
  try {
    const meeting = await StatusLog.findById(req.body.meeting_id)
    meeting.outcome = req.body.outcome
    meeting.outcome_note = req.body.outcome_note
    meeting.outcome_date = moment()
    await meeting.save()

    return res.redirect('/lead')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}
