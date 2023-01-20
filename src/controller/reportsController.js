const { User } = require('../model/User');
const { UserLog } = require('../model/UserLog');
const { UserLogin } = require('../model/UserLogin');
const through = require('through');
const csv = require('csv');
const moment = require('moment-timezone');
exports.index = (req, res) => {
  try {
    return res.render('reports');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};

exports.downloadUserReport = async (req, res) => {
  let search = {};
  if (req.query.from_date) {
    search = { created_at: { $gte: `${req.query.from_date} 00:00:00` } };
  }
  if (req.query.to_date) {
    search = { created_at: { $lte: `${req.query.to_date} 23:59:59` } };
  }
  if (req.query.from_date && req.query.to_date) {
    search = {
      created_at: {
        $gte: `${req.query.from_date} 00:00:00`,
        $lte: `${req.query.to_date} 23:59:59`,
      },
    };
  }
  const fields = [
    'first_name',
    'last_name',
    'email',
    'type',
    'status',
    'created_by',
  ];
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.write(fields.join(',') + '\n');
  const modelStream = User.find(search)
    .select('-_id ' + fields.join(' '))
    .populate({ path: 'created_by', select: 'first_name last_name' })
    .batchSize(100)
    .cursor();
  modelStream.pipe(through(write, end)).pipe(csv.stringify()).pipe(res);
  function end() {
    return res.end();
  }
  function write(doc) {
    const myObject = doc.toObject({ getters: true, virtuals: false });
    let arrQueue = [];
    for (const property of fields) {
      if (myObject.hasOwnProperty(property)) {
        if (property === 'created_by') {
          let user = myObject[property];
          arrQueue.push(`${user.first_name} ${user.last_name}`);
        } else {
          arrQueue.push(myObject[property]);
        }
      } else {
        arrQueue.push('');
      }
    }
    this.queue(arrQueue);
  }
};

exports.downloadUserLogReport = async (req, res) => {
  let search = {};
  if (req.query.from_date) {
    search = { created_at: { $gte: `${req.query.from_date} 00:00:00` } };
  }
  if (req.query.to_date) {
    search = { created_at: { $lte: `${req.query.to_date} 23:59:59` } };
  }
  if (req.query.from_date && req.query.to_date) {
    search = {
      created_at: {
        $gte: `${req.query.from_date} 00:00:00`,
        $lte: `${req.query.to_date} 23:59:59`,
      },
    };
  }
  const fields = ['-_id', 'created_at', 'previous', 'current', 'created_by'];
  res.setHeader('Content-Disposition', 'attachment; filename=user-logs.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.write(fields.join(',') + '\n');
  const modelStream = UserLog.find(search)
    .select('-_id ' + fields.join(' '))
    .populate({ path: 'created_by', select: 'first_name last_name' })
    .batchSize(100)
    .cursor();
  modelStream.pipe(through(write, end)).pipe(csv.stringify()).pipe(res);
  function end() {
    return res.end();
  }
  function write(doc) {
    const myObject = doc.toObject({ getters: true, virtuals: false });
    let arrQueue = [];
    for (const property of fields) {
      if (myObject.hasOwnProperty(property)) {
        if (property === 'created_by') {
          let user = myObject[property];
          arrQueue.push(`${user.first_name} ${user.last_name}`);
        } else {
          arrQueue.push(myObject[property]);
        }
      } else {
        arrQueue.push('');
      }
    }
    this.queue(arrQueue);
  }
};

exports.downloadUserLoginReport = async (req, res) => {
  let search = {};
  if (req.query.from_date) {
    search = { created_at: { $gte: `${req.query.from_date} 00:00:00` } };
  }
  if (req.query.to_date) {
    search = { created_at: { $lte: `${req.query.to_date} 23:59:59` } };
  }
  if (req.query.from_date && req.query.to_date) {
    search = {
      created_at: {
        $gte: `${req.query.from_date} 00:00:00`,
        $lte: `${req.query.to_date} 23:59:59`,
      },
    };
  }
  const fields = ['created_at', 'type', 'user'];
  res.setHeader('Content-Disposition', 'attachment; filename=user-logins.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.write(fields.join(',') + '\n');
  const modelStream = UserLogin.find(search)
    .select('-_id ' + fields.join(' '))
    .batchSize(100)
    .cursor();
  modelStream.pipe(through(write, end)).pipe(csv.stringify()).pipe(res);
  function end() {
    return res.end();
  }
  function write(doc) {
    const myObject = doc.toObject({ getters: true, virtuals: false });
    let arrQueue = [];
    for (const property of fields) {
      if (myObject.hasOwnProperty(property)) {
        if (property === 'created_at') {
          let formatedDate = moment(myObject[property])
            .tz('Asia/Dubai')
            .format('YYYY-MM-DD hh:mm:ss A');
          arrQueue.push(formatedDate);
        } else if (property === 'user') {
          let user = myObject[property];
          arrQueue.push(`${user.first_name} ${user.last_name}`);
        } else {
          arrQueue.push(myObject[property]);
        }
      } else {
        arrQueue.push('');
      }
    }
    this.queue(arrQueue);
  }
};
