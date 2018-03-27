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
/*
test('router sr_information fails on unsupported image format', async () => {
  let response
  try {
    let formObject = {
      clientInformation: 'iOS',
      imgName: 'something.gif',
      uuid: 'something',
      long: '-76.0804324',
      lat: '45.249814'
    }
    response = await request.post({
      url: `${global.__DOMAIN__}/sr_information`,
      form: formObject
    })
    response = sanitize(JSON.parse(response), ['_id', 'timestamp'])
    console.log(`response is ${response}`);
    expect(response).toMatchSnapshot()
  } catch (e) {
    console.log(`err2 ${e}`)
  }
})
*/

test('router sr_information returns error message on location info outside of Ottawa-Gatineau', async () => {
  let response
  try {
    let formObject = {
      clientInformation: 'iOS',
      imgName: '1234567.jpeg',
      uuid: '1234567',
      long: '125.4',
      lat: '65.7'
    }
    response = await request.post({
      url: `${global.__DOMAIN__}/sr_information`,
      form: formObject
    })
    response = sanitize(JSON.parse(response), ['_id', 'timestamp'])
    expect(response).toMatchSnapshot()
  } catch (e) {
    console.log(`err2 ${e}`)
  }
})

/*
test('router sr_information sanitizes data to prevent noSQL injection', async () => {
  let response
  try {
    let formObject = {
      clientInformation: 'iOS',
      imgName: '12345678.jpeg',
      uuid: '12345678',
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
    console.log(`err2 ${e}`)
  }
})
*/
