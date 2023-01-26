const moment = require('moment')
const { StatusLog } = require('../model/StatusLog')

exports.index = async (req, res) => {
  const date_nav = req.query.date_nav || 0;
  const type = req.query.type || 'month';

  let init_date = ''
  var start_date, end_date
  if(type == 'month') {
    let date = moment().add(date_nav, 'M');
    init_date = date.format('YYYY-MM-DD');

    start_date = new moment(date).startOf('month');
    end_date = new moment(date).endOf('month').add(1, 'D');
  }

  const meetings = await StatusLog.getCalendarMeetings(start_date, end_date, req.session.AUTH._id)
  
  return res.render('celendar', {
    meetings,
    init_date,
    search: {
      date_nav, 
      type
    }
  });
};
