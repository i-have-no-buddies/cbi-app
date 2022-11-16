const art = require('express-art-template')
const moment = require('moment')

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

art.template.defaults.imports.formatDate = (value) => {
  if (value) {
    return moment().format('MMM DD-YYYY HH:mm')
  }
  return value
}

module.exports = art
