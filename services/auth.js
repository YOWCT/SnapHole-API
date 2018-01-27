exports.loggedIn = function (req, res, next) {
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
