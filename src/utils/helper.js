const generatePassword = require('generate-password');
const { check, validationResult } = require('express-validator');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const moment = require('moment-timezone');
const csv = require('@fast-csv/parse');
var fs = require('fs');
var inactiveUsers = [];

const ngramsAlgo = (str, field) => {
  try {
    let result_tags = [];
    let words = str.split(' ');
    let loop_counter = words.length < 4 ? words.length : 4;
    for (var x = loop_counter; x > 0; x--) {
      let idx = 0;
      while (idx + x <= words.length) {
        result_tags.push({
          [`${field}`]: words.slice(idx, idx + x).join(' '),
        });
        idx++;
      }
    }
    if (words.length > 4) {
      result_tags.unshift({ [`${field}`]: str });
    }
    return result_tags;
  } catch (error) {
    return [];
  }
};

const ngramsAlgov2 = (str, field) => {
  try {
    let result_tags = [];
    let words = str.split(' ');
    let loop_counter = words.length < 4 ? words.length : 4;
    for (var x = loop_counter; x > 0; x--) {
      let idx = 0;
      while (idx + x <= words.length) {
        result_tags.push({
          [`tag`]: `[${field}]${words.slice(idx, idx + x).join(' ')}`,
        });
        idx++;
      }
    }
    if (words.length > 4) {
      result_tags.unshift({ [`tag`]: `[${field}]${str}` });
    }
    return result_tags;
  } catch (error) {
    return [];
  }
};

const errorFormater = (errors) => {
  let temp_result = {};
  for (let i = 0; i < errors.array().length; i++) {
    temp_result[errors.errors[i].param] = errors.errors[i].msg;
  }
  return temp_result;
};

const readHeader = async (file_location) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file_location);
    csv
      .parseStream(stream, { maxRows: 1 })
      .on('error', (error) => console.error(error))
      .on('data', (header_row) => resolve(header_row));
  });
};

const randomPassword = () => {
  const password = generatePassword.generate({
    length: 10,
    excludeSimilarCharacters: true,
  });
  return password;
};

const tagsSearchFormater = (fields, query) => {
  let tags = [];
  for (var data of fields) {
    if (query[data]) {
      let str_qry = `[${data}]${query[data].toLowerCase().trim()}`;
      tags.push({ 'tags.tag': str_qry });
    }
  }
  if (tags.length) {
    return (search = { $and: tags });
  } else {
    return (search = {});
  }
};

const queryParamReturner = (fields, query) => {
  let search = {};
  for (var data of fields) {
    search[data] = query[data] || '';
  }
  return search;
};

const getFullName = (user) => {
  let firstlast_name = `${user.first_name} ${user.last_name}`;
  let full_name = '';
  firstlast_name.split(' ').forEach(function (str) {
    full_name += str.charAt(0).toUpperCase() + str.slice(1) + ' ';
  });
  return full_name.trim();
};

const logDescriptionFormater = (user, did, what, from = '') => {
  let description = getFullName(user) + ' ';
  description += did.toLowerCase() + ' ';
  description += what + ' ';
  description += from + ' ';
  return description.trim();
};

const arrayChunks = (array, size = 5) => {
  const result = array.reduce((result_array, item, index) => {
    const chunk_index = Math.floor(index / size);

    if (!result_array[chunk_index]) {
      result_array[chunk_index] = []; // start a new chunk
    }
    result_array[chunk_index].push(item);

    return result_array;
  }, []);

  return result;
};

const setInactiveUser = (_id) => {
  inactiveUsers.push(_id);
};

const removeInactiveUser = (_id) => {
  inactiveUsers = inactiveUsers.filter((row) => row != _id);
};

const getInactiveUsers = () => {
  return inactiveUsers;
};

const schemaTagsFormater = (tags, data, field) => {
  if (data) {
    if(field == 'upload_date') {
      tags = [
        ...tags,
        ...ngramsAlgov2(moment(data).format("YYYY-MM-DD"), field),
      ];
    } else if (field == 'allocated_to') {
      tags = [
        ...tags,
        ...ngramsAlgov2(data.toString(), field),
      ];
    } else {
      tags = [
        ...tags,
        ...ngramsAlgov2(data.toLowerCase(), field),
      ];
    }
  }
  return tags
}


const date_format = 'MM/DD/YYYY'
const time_format = 'hh:mm A'
const validateUpload = async (data) => {
  //mobile validate ask?
  await check('first_name').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('last_name').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('job_title').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('company').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('profile_link').trim().isURL().withMessage('Data Empty').run(data);
  await check('gender').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('business_no').trim().custom(value => {
    if(data.body.business_no == '' && data.body.mobile == '' && data.body.second_mobile == '') {
      throw new Error('Atleast 1 Contact is required')
    } else if (value == '') {
      return true
    }
    try {
      number = phoneUtil.parse(`+${value}`, '');
      let is_valid = phoneUtil.isPossibleNumber(number);
      let is_valid2 = phoneUtil.isValidNumber(number);
      if(is_valid && is_valid2) return true
      else throw new Error('Business No Invalid')
    } catch (e) {
      throw new Error('Business No Invalid')
    }
  }).run(data);
  await check('mobile').trim().custom(value => {
    if(data.body.business_no == '' && data.body.mobile == '' && data.body.second_mobile == '') {
      //throw new Error('Atleast 1 Contact is required')
      return true
    } else if (value == '') {
      return true
    }
    try {
      number = phoneUtil.parse(`+${value}`, '');
      let is_valid = phoneUtil.isPossibleNumber(number);
      let is_valid2 = phoneUtil.isValidNumber(number);
      if(is_valid && is_valid2) return true
      else throw new Error('Mobile Invalid')
    } catch (e) {
      throw new Error('Mobile Invalid')
    }
  }).run(data);
  await check('second_mobile').trim().custom(value => {
    if(data.body.business_no == '' && data.body.mobile == '' && data.body.second_mobile == '') {
      //throw new Error('Atleast 1 Contact is required')
      return true
    } else if (value == '') {
      return true
    }
    try {
      number = phoneUtil.parse(`+${value}`, '');
      let is_valid = phoneUtil.isPossibleNumber(number);
      let is_valid2 = phoneUtil.isValidNumber(number);
      if(is_valid && is_valid2) return true
      else throw new Error('Second Mobile Invalid')
    } catch (e) {
      throw new Error('Second Mobile Invalid')
    }
  }).run(data);

  await check('personal_email').trim().custom(value => {
    if(data.body.personal_email == '' && data.body.work_email == '') {
      throw new Error('Atleast 1 Email is required')
    } else if (value == '') {
      return true
    }
    try {
      if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) return true
      else throw new Error('Personal Email Invalid')
    } catch (e) {
      throw new Error('Personal Email Invalid')
    }
  }).run(data);

  await check('work_email').trim().custom(value => {
    if(data.body.personal_email == '' && data.body.work_email == '') {
      //throw new Error('Atleast 1 Email is required')
      return true
    } else if (value == '') {
      return true
    }
    try {
      if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) return true
      else throw new Error('Work Email Invalid')
    } catch (e) {
      throw new Error('Work Email Invalid')
    }
  }).run(data);

  await check('nationality').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('description').trim().notEmpty().withMessage('Data Empty').run(data);

  await check('ifa_email').trim().isEmail().run(data);
  await check('meeting_date').trim().custom(value => {
    let date = moment(value, date_format);
    if(date.isValid()) return true
    else throw new Error('Meeting Date invalid.')
  }).run(data);
  await check('meeting_time').trim().custom(value => {
    let date = moment(value, time_format);
    if(date.isValid()) return true
    else throw new Error('Meeting Time invalid.')
  }).run(data);
  await check('meeting_address').trim().notEmpty().withMessage('Data Empty').run(data);
  await check('meeting_note').trim().notEmpty().withMessage('Data Empty').run(data);

  const result = validationResult(data);
  return result;
};


const errorFormaterCSV = (errors) => {
  let temp_result = '';
  for (let i = 0; i < errors.array().length; i++) {
    temp_result += `[${errors.errors[i].param}] ${errors.errors[i].msg}, \n`;
  }
  return temp_result;
};

module.exports = {
  ngramsAlgo,
  ngramsAlgov2,
  randomPassword,
  errorFormater,
  readHeader,
  tagsSearchFormater,
  queryParamReturner,
  getFullName,
  logDescriptionFormater,
  arrayChunks,
  setInactiveUser,
  removeInactiveUser,
  getInactiveUsers,
  schemaTagsFormater,
  validateUpload,
  errorFormaterCSV
};
