var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var db_manager = require('../db');

const options = {
    algorithm: 'HS256',
    expiresIn: '2h',
    noTimestamp: true
};

router.get('/', (req, res) => {
    let {username, password, redirect} = req.query;
    let secret = req.app.locals.secret;

    if (!(username || password)) {
        res.render('login', {retry: false});
        return;
    } else if (!(username && password)) {
        res.render('login', {retry: true});
        return;
    }

    db_manager.connect()
     .then(db => db.collection('Users'))
     .then(collection => collection.findOne({username: username}))
     .then(user => user ? bcrypt.compare(password, user.password) : Promise.resolve(false))
     .then((success) => {
        if (success) {
            let token = jwt.sign({usr: username}, secret, options);
            res.cookie('jwt', token, {expires: 0});
            res.redirect(redirect ? redirect : '/blog/' + username);
        } else {
            res.render('login', {retry: true});
        }
     }).catch(err => console.log("login error: " + err.message));
});

module.exports = router