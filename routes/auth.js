var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Customer = require('../models/customer');

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function(email, password, done) {
  Customer.findByEmail(email, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }
    Customer.verifyPassword(password, user.password, function(err, result) {
      if (err) {
        return done(err);
      }
      if (!result) {
        return done(null, false);
      }
      delete user.password;
      done(null, user);
    })
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Customer.findCustomer(id, function(err, user) {
    if (err) {
      return done(err);
    }
    done(null, user);
  });
});

router.post('/local/login', function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send({
        message: 'Login failed!!!'
      });
    }
    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      next();
    });
  })(req, res, next);
}, function(req, res, next) {
  var user = {};
  user.email = req.user.email;
  user.name = req.user.name;
  res.send({
    message: 'local login',
    user: user
  });
});

router.get('/local/logout', function(req, res, next) {
  req.logout();
  res.send({ message: 'local logout' });
});

router.get('/facebook', function(req, res, next) {
  res.send({ message: 'facebook' });
});

router.get('/facebook/callback', function(req, res, next) {
  res.send({ message: 'facebook callback' });
});

router.post('/facebook/token', function(req, res, next) {
  res.send({ message: 'facebook token' });
});

module.exports = router;