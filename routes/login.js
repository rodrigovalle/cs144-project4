var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var db_manager = require('../db');

const secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';
const options = {
    algorithm: 'HS256',
    expiresIn: '2h',
    noTimestamp: true
};

router.get('/', (req, res) => {
    let {username, password, redirect} = req.query;

    if (!(username && password)) {
        res.render('login');
    }

    db_manager.connect()
     .then(db => db.collection('Users'))
     .then(collection => collection.findOne({username: username}))
     .then(user => bcrypt.compare(password, user.password))
     .then((success) => {
        if (success) {
            let token = jwt.sign({usr: req.query.username}, secret, options);
            res.cookie('jwt', token, {expires: 0});
            res.redirect(redirect ? redirect : '/blog/' + username);
        } else {
            res.render('login');
        }
     }).catch(err => console.log("login error: " + err.message));
});

module.exports = router