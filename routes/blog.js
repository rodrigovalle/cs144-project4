var express = require('express');
var router = express.Router();
var commonmark = require('commonmark');
var db = require('../db');
var querystring = require('querystring');

var parser = new commonmark.Parser()
var renderer = new commonmark.HtmlRenderer();

function postToHTML(post) {
    let {username, title, body, modified, created} = post;
    title = title || '';
    body = body || '';

    return {
        title: title,
        author: username,
        htmlTitle: renderer.render(parser.parse(title)),
        htmlBody: renderer.render(parser.parse(body)),
        modified: modified,
        created: created
    };
}

router.get('/:username', (req, res) => {
    let start = 1;
    if (req.query.start) {
        start = parseInt(req.query.start);
        if (start <= 0 || isNaN(start)) {
            req.query.start = 1;
            res.redirect(req.baseUrl + req.path + '?' + querystring.stringify(req.query));
            return;
        }
    }

    const user_query = {
        username: req.params.username
    };

    const post_query = {
        username: req.params.username,
        postid: { $gte: start }
    };

    const post_query_opts = {
        projection: { _id: 0 },
        sort: { postid: 1 },
        limit: 6
    };

    let p1 = db.collection('Users')
               .then(collection => collection.findOne(user_query))

    let p2 = db.collection('Posts')
               .then(collection => collection.find(post_query, post_query_opts))
               .then(cursor => cursor.toArray())

    Promise.all([p1, p2]).then((values) => {
        let [user, posts] = values;
        if (!user) {
            res.render('error', {
                message: 'User not found',
                error: {status: '', stack: ''}
            });
        } else {
            res.render('userpage', {
                username: req.params.username,
                posts: posts.slice(0,5).map(postToHTML),
                next: posts[5] ? posts[5].postid : null
            });
        }
    })
    .catch(err => console.log('ERROR: ' + err.message));
})

router.get('/:username/:postid', (req, res) => {
    // TODO: what if invalid postid/integer?
    const query = {
        username: req.params.username,
        postid: parseInt(req.params.postid)
    };

    const error_page = {
        message: 'Post not found',
        error: {status: '', stack: ''}
    }

    db.collection('Posts')
    .then(collection => collection.findOne(query))
    .then(post =>
        post ? res.render('post', postToHTML(post)) :
               res.render('error', error_page)
    )
    .catch(err => console.log('ERROR: ' + err.message));
})

module.exports = router;
