const test = require('tape')
const geolocation = require('./geolocation')

test('geolocation', t => {
  t.equal(geolocation(45.40, -75.70), 'ottawa', 'point in ottawa')
  t.equal(geolocation(45.43, -75.72), 'gatineau', 'point in gatineau')
  t.equal(geolocation(65.40, 125.7), undefined, 'point not found')
  t.end()
})
