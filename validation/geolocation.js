const path = require('path')
const load = require('load-json-file')
const { point } = require('@turf/helpers')
const contains = require('@turf/boolean-contains')

// GeoJSON Cities
const ottawa = load.sync(path.join(__dirname, '..', 'cities', 'ottawa.geojson'))
const gatineau = load.sync(
  path.join(__dirname, '..', 'cities', 'gatineau.geojson')
)

/**
 * GeoLocation validation
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} approved city (ottawa/gatineau)
 * @example
 * geolocation(45.40, -75.70)
 * //='ottawa'
 * geolocation(45.43, -75.72)
 * //='gatineau'
 * geolocation(65.40, 125.7)
 * //=undefined
 */
module.exports = function (latitude, longitude) {
  const pt = point([longitude, latitude])
  if (contains(ottawa, pt)) return 'ottawa'
  if (contains(gatineau, pt)) return 'gatineau'
  return undefined
}
