const { ngramsAlgo } = require('../src/utils/helper')

test('Test for Ngrams', () => {
  var result = [...ngramsAlgo('ab cd', 'tag')]
  expect(result).toStrictEqual([{ tag: 'ab cd' }, { tag: 'ab' }, { tag: 'cd' }])
})
