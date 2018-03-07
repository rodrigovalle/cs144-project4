var jwt = require('jsonwebtoken');

function authenticate(redirect='') {
  function die(res) {
      res.status(401);
      if (redirect) {
        res.redirect(redirect);
      } else {
        res.end();
      }
  }

  return function(req, res, next) {
    if (!('jwt' in req.cookies)) {
      die(res);
      return;
    }

    let secret = req.app.locals.secret;
    let auth = req.cookies.jwt;

    new Promise((resolve, reject) =>
      jwt.verify(auth, secret, {algorithms: ['HS256']}, (err, decoded) =>
          err ? reject(err) : resolve(decoded)
      )
    )
    .then(decoded => {
      req.jwt = decoded;
      next();
    })
    .catch(err => die(res));
  }
}

module.exports = authenticate;