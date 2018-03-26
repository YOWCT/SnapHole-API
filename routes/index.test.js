let request = require('request-promise-native')
let _ = require('lodash')

function sanitize (data, keys) {
  return keys.reduce((result, key) => {
    const val = _.get(result, key)
    if (!val || _.isArray(val) || _.isObject(val)) {
      return result
    } else {
      return _.set(_.cloneDeep(result), key, '[SANITIZED]')
    }
  }, data)
}

test('router sr_information adds information', async () => {
  let response
  try {
    let formObject = {
      clientInformation: 'n/a',
      imgName: '123456.jpeg',
      uuid: '123456',
      long: '-76.0804324',
      lat: '45.249814'
    }
    response = await request.post({
      url: `${global.__DOMAIN__}/sr_information`,
      form: formObject
    })
    response = sanitize(JSON.parse(response), ['_id', 'timestamp'])
    expect(response).toMatchSnapshot()
  } catch (e) {
    console.log(`err ${e}`)
  }
})
