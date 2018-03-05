var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var db_manager = require('../db');

let jwt_options = {
    algorithms: ['HS256']
}

router.get('/:username', (req, res) => {
    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.find({username: req.params.username}, {sort: {postid: 1}}))
     .then(cursor => cursor.toArray())
     .then(documents => res.status(200).send(documents))
     .catch(err => console.log('database error: ' + err.message));
});

router.get('/:username/:postid', (req, res) => {
    // TODO: invalid postid?
    let query = {
        username: req.params.username,
        postid: parseInt(req.params.postid)
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.findOne(query))
     .then(document => document ? res.status(200).send(document) : res.status(404).end())
     .catch(err => console.log('database error: ' + err.message));
});

router.post('/:username/:postid', (req, res) => {
    // TODO: invalid postid?
    let document = {
        postid: parseInt(req.params.postid),
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
    // TODO: invalid postid?
    let filter = {
        username: req.params.username,
        postid: parseInt(req.params.postid),
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
        postid: parseInt(req.params.postid),
    };

    db_manager.connect()
     .then(db => db.collection('Posts'))
     .then(collection => collection.deleteOne(query))
     .then(result => result.deletedCount ? res.status(204).end() : res.status(400).end())
     .catch(err => console.log('database error: ' + err.message));
});

module.exports = router;