var mysql = require('mysql');
var async = require('async');
var dbConfig = require('../config/dbConfig');

function createMenu(menu, callback) {
  var sql_insert_menu = 'INSERT INTO menu(name, price) ' +
                        'VALUES (?, ?)';
  var sql_insert_file = 'INSERT INTO file(menu_id, filename, filepath) ' +
                        'VALUES (?, ?, ?)';

  var menu_id;
  var dbConn = mysql.createConnection(dbConfig);

  dbConn.beginTransaction(function (err) {
    if (err) {
      return callback(err);
    }

    async.series([insertMenu, insertFile], function (err) {
      if (err) {
        return dbConn.rollback(function () {
          callback(err);
          dbConn.end();
        });
      }
      dbConn.commit(function () {
        callback(null, menu_id);
        dbConn.end();
      })
    });
  });

  function insertMenu(callback) {
    dbConn.query(sql_insert_menu, [menu.name, menu.price], function(err, result) {
      if (err) {
        return callback(err);
      }
      menu_id = result.insertId;
      callback(null);
    });
  }

  function insertFile(callback) {
    async.each(menu.files, function(item, done) {
      dbConn.query(sql_insert_file, [menu_id, item.name, item.path], function(err, result) {
        if (err) {
          return done(err);
        }
        done(null);
      });
    }, function(err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }
}

module.exports.createMenu = createMenu;