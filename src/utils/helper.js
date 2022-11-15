const ngramsAlgo = (str, field) => {
  try {
    let result_tags = []
    let words = str.split(' ')
    let loop_counter = words.length < 4 ? words.length : 4
    for (var x = loop_counter; x > 0; x--) {
      let indx = 0
      while (indx + x <= words.length) {
        result_tags.push({
          [`${field}`]: words.slice(indx, indx + x).join(' '),
        })
        indx++
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

module.exports = {
  ngramsAlgo,
  errorFormater,
}
