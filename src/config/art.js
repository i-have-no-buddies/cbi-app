const art = require('express-art-template')
const moment = require('moment-timezone');

art.template.defaults.imports.dateFormat = (date) => {
  if (date) {
    return moment(date).tz('Asia/Dubai').format('YYYY-MM-DD hh:mm A');
  }
  return date;
}

art.template.defaults.imports.escapeBackslash = (value) => {
  if (value) {
    return value.replace(/\\/g, '')
  }
  return value
}

art.template.defaults.imports.activeNav = (navigation, value) => {
  if (navigation == value) {
    return 'active'
  }
  return ''
}

module.exports = art
