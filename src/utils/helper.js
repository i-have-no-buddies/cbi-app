const generatePassword = require('generate-password');
const csv = require('@fast-csv/parse');
var fs = require('fs');

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
  let firstlast_name = `${user.first_name} ${user.last_name}`
  let full_name = ''
  firstlast_name.split(' ').forEach(function(str) {
    full_name += str.charAt(0).toUpperCase() + str.slice(1) + ' ';
  });
  return full_name.trim();
};

const logDescriptionFormater = (user, did, what, from = '') => {
  let description = getFullName(user) + ' '
  description += did.toLowerCase() + ' '
  description += what + ' '
  description += from + ' '
  return description.trim();
};

const arrayChunks = (array, size = 5) => {
  const result = array.reduce((result_array, item, index) => { 
    const chunk_index = Math.floor(index/size)
  
    if(!result_array[chunk_index]) {
      result_array[chunk_index] = [] // start a new chunk
    }
    result_array[chunk_index].push(item)
  
    return result_array
  }, [])

  return result
}

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
  arrayChunks
};
