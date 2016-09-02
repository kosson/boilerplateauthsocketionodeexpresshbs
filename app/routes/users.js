var express = require('express'),
    router = express.Router(),
    config = require('../../config/config'),
    mongoose = require('mongoose'),
    User = require('../models/users'),
    wisperSecret = config.secret;

// Un middleware de debug
mongoose.set('debug', function(coll, method, query, doc) {
  console.log(coll + " " + method + " " + JSON.stringify(query) + " " + JSON.stringify(doc));
});

router.route('/')
      .get(function(req, res, next) {

        // Afișează template-ul
        res.render('login', {
          title: 'Login'
        });
      });

router.route('/signin')
      .get(function(req, res, next){
        res.render('signin', {
          title: 'Signin'
        });
      });

module.exports = router;
