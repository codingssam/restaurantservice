var mysql = require('mysql');
var async = require('async');
var dbPool = require('../models/common').dbPool;

function findByEmail(email, callback) {
  var sql = 'SELECT id, name, email, password FROM customer WHERE email = ?';
  dbPool.getConnection(function(err, dbConn) {
    if (err) {
      return callback(err);
    }
    dbConn.query(sql, [email], function(err, results) {
      dbConn.release();
      if (err) {
        return callback(err);
      }
      if (results.length === 0) {
        return callback(null, null);
      }
      callback(null, results[0]);
    })
  });
}

function verifyPassword(password, hashPassword, callback) {
  var sql = 'SELECT SHA2(?, 512) password';
  dbPool.getConnection(function(err, dbConn){
    if (err) {
      return callback(err);
    }
    dbConn.query(sql, [password], function(err, results) {
      dbConn.release();
      if (err) {
        return callback(err);
      }
      if (results[0].password !== hashPassword) {
        return callback(null, false)
      }
      callback(null, true);
    });
  });
}

function findCustomer(customerId, callback) {
  var sql = 'SELECT id, name, email, facebookid FROM customer WHERE id = ?';
  dbPool.getConnection(function(err, dbConn) {
    if (err) {
      return callback(err);
    }
    dbConn.query(sql, [customerId], function(err, results) {
      dbConn.release();
      if (err) {
        return callback(err);
      }
      var user = {};
      user.id = results[0].id;
      user.name = results[0].name;
      user.email = results[0].email;
      user.facebookid = results[0].facebookid;
      callback(null, user);
    });
  });
}

function findOrCreate(profile, callback) {
  var sql_facebookid = "select id, name, email, facebookid " +
                       "from customer " +
                       "where facebookid = ?";
  var sql_insert_facebookid = "insert into customer(name, email, facebookid) " +
                              "value (?, ?, ?)";

  dbPool.getConnection(function(err, dbConn) {
    if (err) {
      return callback(err);
    }
    dbConn.query(sql_facebookid, [profile.id], function(err, results) {
      if (err) {
        dbConn.release();
        return callback(err);
      }
      if (results.length !== 0) {
        dbConn.release();
        var user = {};
        user.id = results[0].id;
        user.name = results[0].name;
        user.email = results[0].email;
        user.facebookid = results[0].facebookid;
        return callback(null, user);
      }
      dbConn.query(sql_insert_facebookid, [profile.displayName, profile.emails[0].value, profile.id], function(err, result) {
        dbConn.release();
        if (err) {
          return callback(err);
        }
        var user = {};
        user.id = result.insertId;
        user.name = profile.displayName;
        user.email = profile.emails[0].value;
        user.facebookid = profile.id;
        return callback(null, user);
      });
    });
  });
}

function registerCustomer(newCustomer, callback) {

}

function updateCustomer(customer, callback) {

}

function listCustomers(pageNo, rowCount, callback) {

}

module.exports.findCustomer = findCustomer;
module.exports.registerCustomer = registerCustomer;
module.exports.updateCustomer = updateCustomer;
module.exports.listCustomers = listCustomers;
module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findOrCreate = findOrCreate;
