const generatePassword = require('generate-password');

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
};
