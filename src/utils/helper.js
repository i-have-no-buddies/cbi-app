const generatePassword = require('generate-password');
const csv = require('@fast-csv/parse')
var fs = require('fs')

const ngramsAlgo = (str, field) => {
  try {
    let result_tags = []
    let words = str.split(' ')
    let loop_counter = words.length < 4 ? words.length : 4
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
      result_tags.unshift({ [`${field}`]: str })
    }
    return result_tags
  } catch (error) {
    return []
  }
}

const errorFormater = (errors) => {
  let temp_result = {}
  for (let i = 0; i < errors.array().length; i++) {
    temp_result[errors.errors[i].param] = errors.errors[i].msg
  }
  return temp_result
}

const readHeader = async (file_location) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file_location)
    csv
      .parseStream(stream, { maxRows: 1 })
      .on('error', (error) => console.error(error))
      .on('data', (header_row) => resolve(header_row))
  })
}

const randomPassword = () => {
  const password = generatePassword.generate({
    length: 10,
    excludeSimilarCharacters: true,
  });
  return password;
}

module.exports = {
  ngramsAlgo,
  randomPassword,
  errorFormater,
  readHeader,
}
