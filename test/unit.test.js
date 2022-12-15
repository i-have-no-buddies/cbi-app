const {
  ngramsAlgo,
  ngramsAlgov2,
  tagsSearchFormater,
  queryParamReturner,
  getFullName
} = require('../src/utils/helper')

test('Test for Ngrams', () => {
  var result = [...ngramsAlgo('ab cd', 'tag')]
  expect(result).toStrictEqual([{ tag: 'ab cd' }, { tag: 'ab' }, { tag: 'cd' }])
})

test('Test for Ngramsv2', () => {
  var result = [...ngramsAlgov2('ab cd', 'name')]
  expect(result).toStrictEqual([
    { tag: '[name]ab cd' },
    { tag: '[name]ab' },
    { tag: '[name]cd' },
  ])
})

test('Test for tagsSearch', () => {
  var query = { name: 'hallooo', job: 'devs', company: 'hal' }
  var result = tagsSearchFormater(['name', 'job', 'company'], query)
  expect(result).toStrictEqual({
    $and: [
      { 'tags.tag': '[name]hallooo' },
      { 'tags.tag': '[job]devs' },
      { 'tags.tag': '[company]hal' },
    ],
  })
})

test('Test for queryParamReturner', () => {
  var query = { name: 'hallooo', company: 'hal' }
  var result = queryParamReturner(['name', 'job', 'company'], query)
  expect(result).toStrictEqual({
    name: 'hallooo',
    job: '',
    company: 'hal',
  })
})

test('Test for getFullName', () => {
  var query = { first_name: 'general luna', last_name: 'general heny' }
  var result = getFullName(query)
  expect(result).toStrictEqual('General Luna General Heny')
})


