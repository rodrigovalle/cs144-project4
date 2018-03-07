var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var db_manager = require('../db');

// authenticate
router.use('/:username', (req, res, next) => {
    if (!('jwt' in req.cookies)) {
        res.status(401).end();
        return;
    }

    let secret = req.app.locals.secret;
    let auth = req.cookies.jwt

    new Promise((resolve, reject) => {
        jwt.verify(auth, secret, {algorithms: ['HS256']}, (err, decoded) =>
            err ? reject(err) : resolve(decoded)
        );
    }).then(decoded => {
        if (decoded.usr === req.params.username) {
            next()
        } else {
            res.status(401).end();
        }
    }).catch(err => res.status(401).end());
});

router.get('/:username', (req, res) => {
    let query = {
        username: req.params.username
    };

    let query_opts = {
        sort: {postid: 1},
        projection: {_id: 0}
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.find(query, query_opts))
     .then(cursor => cursor.toArray())
     .then(documents => res.status(200).send(documents))
     .catch(err => console.log('database error: ' + err.message));
});

// parse postid, store in req.postid
router.use('/:username/:postid', (req, res, next) => {
    let postid = Number(req.params.postid);
    if (isNaN(postid) || !Number.isInteger(postid) || postid <= 0) {
        res.status(400).end();
        return;
    }

    req.postid = postid;
    next();
});

router.get('/:username/:postid', (req, res) => {
    let query = {
        username: req.params.username,
        postid: req.postid
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.findOne(query))
     .then(document => document ? res.status(200).send(document) : res.status(404).end())
     .catch(err => console.log('database error: ' + err.message));
});

router.post('/:username/:postid', (req, res) => {
    if (!('title' in req.body && 'body' in req.body
          && typeof req.body.title === 'string'
          && typeof req.body.body  === 'string')) {
        res.status(400).end();
        return;
    }

    let document = {
        postid: req.postid,
        username: req.params.username,
        created: Date.now(),
        modified: Date.now(),
        title: req.body.title,
        body: req.body.body
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.insertOne(document))
     .then(result => result.insertedCount ? res.status(201).end() : res.status(400).end())
     .catch(err => res.status(400).end());
});

router.put('/:username/:postid', (req, res) => {
    if (!('title' in req.body && 'body' in req.body
          && typeof req.body.title === 'string'
          && typeof req.body.body  === 'string')) {
        res.status(400).end();
        return;
    }

    let filter = {
        username: req.params.username,
        postid: req.postid,
    };

    let delta = {
        $set: {
            modified: Date.now(),
            title: req.body.title,
            body: req.body.body
        }
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.updateOne(filter, delta))
     .then(result => result.modifiedCount ? res.status(200).end() : res.status(400).end())
     .catch(err => console.log('database error: ' + err.message));
});

router.delete('/:username/:postid', (req, res) => {
    let query = {
        username: req.params.username,
        postid: req.postid,
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.deleteOne(query))
     .then(result => result.deletedCount ? res.status(204).end() : res.status(400).end())
     .catch(err => console.log('database error: ' + err.message));
});

module.exports = router;