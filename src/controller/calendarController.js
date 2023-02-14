const moment = require('moment')
const { ObjectId } = require('mongodb')
const { StatusLog } = require('../model/StatusLog')
const { OUTCOME } = require('../model/Lead')


exports.index = async (req, res) => {
  const date_nav = req.query.date_nav || 0;
  const view_type = req.query.view_type || 'timeGridWeek';
  const outcome = req.query.outcome || 'NEW';

  let init_date = ''
  var start_date, end_date
  if(view_type == 'dayGridMonth') {
    let date = moment().add(date_nav, 'M');
    init_date = date.format('YYYY-MM-DD');

    start_date = new moment(date).startOf('month');
    end_date = new moment(date).endOf('month').add(1, 'D');
  }
  if(view_type == 'timeGridWeek') {
    let date = moment().add(date_nav, 'w');
    init_date = date.format('YYYY-MM-DD');

    start_date = new moment(date).startOf('week');
    end_date = new moment(date).endOf('week').add(1, 'D');
  }
  
  var meetings = await StatusLog.find({
    status_log: 'MEETING',
    created_by: ObjectId(req.session.AUTH._id),
    datetime: {$gte: start_date, $lt: end_date},
  })
  .populate({ path: 'lead_id', select: 'first_name last_name hierarchy' })
  .select('_id lead_id note outcome datetime address')
  .lean()

  //probelem with auth
  const outcome_list = {'NEW':'NEW', MEETING_SAT: 'MEETING_SAT', NO_SHOW: 'NO_SHOW', CANCELED: 'CANCELED'}
  return res.render('calendar', {
    meetings,
    init_date,
    outcome_list,
    search: {
      date_nav, 
      view_type, 
      outcome
    }
  });
};
