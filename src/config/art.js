const art = require('express-art-template');
const moment = require('moment-timezone');

art.template.defaults.imports.formatDate = (date) => {
  if (date) {
    return moment(date).tz('Asia/Dubai').format('YYYY-MM-DD hh:mm A');
  }
  return date;
};

art.template.defaults.imports.escapeBackslash = (value) => {
  if (value) {
    return value.replace(/\\/g, '');
  }
  return value;
};

art.template.defaults.imports.activeNav = (navigation, value) => {
  if (navigation == value) {
    return 'active';
  }
  return '';
};

art.template.defaults.imports.titleCase = (str) => {
  if (str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
      })
      .join(' ');
  }
  return str;
};

art.template.defaults.imports.strLimitNav = (str) => {
  if (str.length > 10) {
    return `${str.substring(0, 10)}...`;
  }
  return str;
};

module.exports = art;
