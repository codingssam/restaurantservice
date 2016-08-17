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
