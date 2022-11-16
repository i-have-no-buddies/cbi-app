const art = require('express-art-template')

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
