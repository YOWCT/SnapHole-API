var fs = require('fs-extra')

/**
 * Pass directory path
 * Return list of files in directory
 * @param  {string} directory - array of js objects
 * @param  {array} filelist - array of js objects
 * @return {array} List of files in directory
 */
walkSync = function (dir, filelist) {
  var fs = fs || require('fs'),
    files = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach(function (file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist)
    } else {
      filelist.push(file)
    }
  })
  return filelist
}

exports.guid = function guid () {
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
}

function s4 () {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
}

function directoryExists (path) {
  try {
    return fs.statSync(path).isDirectory()
  } catch (err) {
    return false
  }
}
/**
 * Pass an array of JS objects which may contain duplicates
 * Return Values and Count for each
 * @param  {array} original - array of js objects
 * @return {array} Values and Count for each value
 */
exports.compressArray = function (original) {
  var compressed = []
  // make a copy of the input array
  var copy = original.slice(0)

  // first loop goes over every element
  for (var i = 0; i < original.length; i++) {
    var myCount = 0
    // loop over every element in the copy and see if it's the same
    for (var w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        // increase amount of times duplicate is found
        myCount++
        // sets item to undefined
        delete copy[w]
      }
    }

    if (myCount > 0) {
      var a = new Object()
      a.value = original[i]
      a.count = myCount
      compressed.push(a)
    }
  }
  return compressed
}
