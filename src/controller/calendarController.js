const moment = require('moment')
const { ObjectId } = require('mongodb')
const { StatusLog } = require('../model/StatusLog')
const { OUTCOME } = require('../model/Lead')


exports.index = async (req, res) => {
  const date_nav = req.query.date_nav || 0;
  const view_type = req.query.view_type || 'timeGridWeek';
  const outcome = req.query.outcome || 'BOOKED';

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

  let search_outcome = outcome == 'BOOKED' ? '' : outcome
  const outcome_list = {'BOOKED':'BOOKED', ...OUTCOME}

  
  var meetings = await StatusLog.find({
    status_log: 'MEETING',
    outcome: search_outcome,
    created_by: ObjectId(req.session.AUTH._id),
    datetime: {$gte: start_date, $lt: end_date},
  })
  .populate({ path: 'lead_id', select: 'first_name last_name' })
  .select('_id lead_id note outcome datetime address')
  .lean()

  
  return res.render('celendar', {
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
