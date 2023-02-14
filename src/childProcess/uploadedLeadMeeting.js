require('../config/mongodb');
const { ObjectId } = require('mongodb');
const { Lead } = require('../model/Lead');
const { StatusLog } = require('../model/StatusLog');

const moment = require('moment-timezone')
const date_format = 'MM/DD/YYYY hh:mm A'
const time_format = 'YYMMDDhhA'

process.on('message', async ({ lead_batch }) => {
  var leads = await Lead.find({lead_batch_id: ObjectId(lead_batch._id)}).select('_id uploaded_meeting action_page').lean()
  
  for(let doc of leads) {
    let datetime = moment(`${doc.uploaded_meeting.meeting_date} ${doc.uploaded_meeting.meeting_time}`, date_format);
    const new_status_log = new StatusLog();
    new_status_log.created_by = doc.uploaded_meeting.created_by;
    new_status_log.updated_by = doc.uploaded_meeting.updated_by;
    new_status_log.lead_id = ObjectId(doc._id);
    new_status_log.status_log = doc.uploaded_meeting.status_log;
    new_status_log.outcome = doc.uploaded_meeting.outcome;
    new_status_log.note = doc.uploaded_meeting.note; 
    new_status_log.address = doc.uploaded_meeting.address;
    new_status_log.action_page = doc.action_page;
    new_status_log.datetime = datetime;
    new_status_log.meeting_time = datetime.format(time_format);
    new_status_log.save({ uploaded: true });
  }
})
