const art = require('express-art-template');
const moment = require('moment-timezone');
const { USER_TYPE, USER_STATUS } = require('../model/User');

art.template.defaults.imports.formatDate = (
  date,
  format = 'YYYY-MM-DD hh:mm A'
) => {
  if (date) {
    return `<span class="text-info">${moment(date).tz('Asia/Dubai').format(format)}</span>`;
  }
  return date;
};

art.template.defaults.imports.escapeBackslash = (str) => {
  if (str) {
    return str.replace(/\\/g, '');
  }
  return str;
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

art.template.defaults.imports.strLimit = (str, limit = 10) => {
  if (str.length > limit) {
    return `${str.substring(0, limit)}...`;
  }
  return str;
};

art.template.defaults.imports.userTypeBadge = (type) => {
  if (type === USER_TYPE.SUPER_ADMIN) {
    return `<span class="badge bg-purple">${type}</span>`;
  }
  if (type === USER_TYPE.ADMIN) {
    return `<span class="badge bg-info">${type}</span>`;
  }
  if (type === USER_TYPE.MANAGER) {
    return `<span class="badge bg-success">${type}</span>`;
  }
  if (type === USER_TYPE.IFA) {
    return `<span class="badge bg-success">${type}</span>`;
  }
  if (type === USER_TYPE.BDM) {
    return `<span class="badge bg-teal">${type}</span>`;
  }
  return `<span>${type}</span>`;
};

art.template.defaults.imports.userStatusBadge = (status) => {
  if (status === USER_STATUS.ACTIVE) {
    return `<span class="badge bg-teal">${status}</span>`;
  }
  if (status === USER_STATUS.INACTIVE) {
    return `<span class="badge bg-maroon">${status}</span>`;
  }
  return `<span>${status}</span>`;
};

art.template.defaults.imports.strReplace = (str, replace = '_') => {
  if (str) {
    const regexExp = new RegExp(`${replace}`, 'g');
    return str.replace(regexExp, ' ');
  }
  return str;
};

module.exports = art;
