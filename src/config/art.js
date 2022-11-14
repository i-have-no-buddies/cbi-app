const art = require('express-art-template');

art.template.defaults.imports.escapeBackslash = (value) => {
  if (value) {
    return value.replace(/\\/g, '');
  }
  return value;
};

module.exports = art;
