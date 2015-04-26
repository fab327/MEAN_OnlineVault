var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Doc = mongoose.model('Doc');
var User = mongoose.model('User');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.param('doc', function (req, res, next, id) {
    var query = Doc.findById(id);

    query.exec(function (err, post) {
        if (err) {
            return next(err);
        }
        if (!post) {
            return next(new Error('can\'t find document'));
        }

        req.post = post;
        return next();
    });
});

/* GET docs page. */
router.get('/docs', function (req, res, next) {
    //Doc.find({ author:'fab' }).find(function (err, docs) {
    Doc.find(function (err, docs) {
        if (err) {
            return next(err);
        }

        res.json(docs);
    })
});

/* Inserting docs */
router.post('/docs', auth, function (req, res, next) {
    var post = new Doc(req.body);
    post.author = req.payload.username;

    post.save(function (err, doc) {
        if (err) {
            return next(err);
        }

        res.json(doc);
    });
});

//router.get('/docs/:doc', function (req, res) {
//
//    req.post.populate('comments', function (err, doc) {
//        if (err) {
//            return next(err);
//        }
//
//        res.json(doc);
//    })
//});

/* Registration/Authentication */
router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    // Check if username is already taken first
    User.findOne({username: req.body.username}, function(err, user) {
        if (user) {
            return res.status(500).json({message: 'Username already taken'});
        }

        var user = new User();
        user.username = req.body.username;
        user.setPassword(req.body.password);
        user.save(function (err) {
            if (err) {
                return next(err);
            }

            return res.json({token: user.generateJWT()})
        });
    });
});

router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;
