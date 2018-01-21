exports.loggedIn = function (req, res, next) {
  console.log('inside auth function', req.user)
  if (req.user) {
    next()
  } else {
    res.redirect('/users/login')
  }
}

exports.isClient = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/users/login')
  }
}
