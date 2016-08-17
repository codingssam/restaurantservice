var mysql = require('mysql');
var async = require('async');
var dbConfig = require('../config/dbConfig');

function findByEmail(email, callback) {
  var sql = 'SELECT id, name, email, password FROM customer WHERE email = ?';
  var dbConn = mysql.createConnection(dbConfig);

  dbConn.query(sql, [email], function(err, results) {
    if (err) {
      dbConn.end();
      return callback(err);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    dbConn.end();
    callback(null, results[0]);
  })
}

function verifyPassword(password, hashPassword, callback) {
  var sql = 'SELECT SHA2(?, 512) password';
  var dbConn = mysql.createConnection(dbConfig);

  dbConn.query(sql, [password], function(err, results) {
    if (err) {
      dbConn.end();
      return callback(err);
    }

    if (results[0].password !== hashPassword) {
      dbConn.end();
      return callback(null, false)
    }
    dbConn.end();
    callback(null, true);
  });
}

function findCustomer(customerId, callback) {
  var sql = 'SELECT id, name, email, facebookid FROM customer WHERE id = ?';
  var dbConn = mysql.createConnection(dbConfig);

  dbConn.query(sql, [customerId], function(err, results) {
    if (err) {
      dbConn.end();
      return callback(err);
    }
    dbConn.end();
    var user = {};
    user.id = results[0].id;
    user.name = results[0].name;
    user.email = results[0].email;
    user.facebookid = results[0].facebookid;
    callback(null, user);
  });
}

function findOrCreate(profile, callback) {
  var sql_facebookid = "select id, name, email, facebookid " +
                       "from customer " +
                       "where facebookid = ?";
  var sql_insert_facebookid = "insert into customer(name, email, facebookid) " +
                              "value (?, ?, ?)";

  var dbConn = mysql.createConnection(dbConfig);
  dbConn.query(sql_facebookid, [profile.id], function(err, results) {
    if (err) {
      dbConn.end();
      return callback(err);
    }
    if (results.length !== 0) {
      dbConn.end();
      return callback(null, results);
    }
    dbConn.query(sql_insert_facebookid, [profile.displayName, profile.email, profile.id], function(err, result) {
      if (err) {
        dbConn.end();
        return callback(err);
      }
      dbConn.end();
      var user = {};
      user.id = result.insertId;
      user.name = profile.displayName;
      user.email = profile.email;
      user.facebookid = profile.id;
      return callback(null, user);
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
