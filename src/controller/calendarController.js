const moment = require('moment')
const { StatusLog } = require('../model/StatusLog')

exports.index = async (req, res) => {
  const date_nav = req.query.date_nav || 0;
  const view_type = req.query.view_type || 'timeGridWeek';

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

  const meetings = await StatusLog.getCalendarMeetings(start_date, end_date, req.session.AUTH._id)
  
  return res.render('celendar', {
    meetings,
    init_date,
    search: {
      date_nav, 
      view_type
    }
  });
};
