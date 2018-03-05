var express = require('express');
var router = express.Router();
var commonmark = require('commonmark');
var db_manager = require('../db');
var querystring = require('querystring');

var parser = new commonmark.Parser()
var renderer = new commonmark.HtmlRenderer();

function postToHTML(post) {
    return {
        title: post.title,
        htmlTitle: renderer.render(parser.parse(post.title)),
        htmlBody: renderer.render(parser.parse(post.body))
    };
}

router.get('/:username', (req, res) => {
    // TODO: invalid username?
    let n = 0;
    let query = { username: req.params['username'] };

    if ('start' in req.query) {
        let start = parseInt(req.query.start);
        if (start <= 0) {
            req.query.start = 1;
            console.log(req.path);
            res.redirect(req.baseUrl + req.path + '?' + querystring.stringify(req.query));
        }
        n = start - 1;
    }

    // TODO:
    // - display HTML formatted title and body for each post with modified and
    //   created date/time
    // - make 'next' link disappear when no more posts are available
    db_manager.connect()
      .then(db => db.collection('Posts'))
      .then(collection => collection.find(query, {sort: {postid: 1}}))
      .then(cursor => cursor.skip(n).limit(5).toArray())
      .then(posts => res.render('userpage', {username: query.username, posts: posts, start: n}))
      .catch(err => console.log('ERROR: ' + err.message));
})

router.get('/:username/:postid', (req, res) => {
    // TODO: what if invalid postid/integer?
    let query = {
        username: req.params['username'],
        postid: parseInt(req.params['postid'])
    };

    db_manager.connect()
      .then(db => db.collection('Posts'))
      .then(collection => collection.findOne(query))
      .then(post => res.render('post', postToHTML(post)))
      .catch(err => console.log('ERROR: ' + err.message));
})

module.exports = router;
