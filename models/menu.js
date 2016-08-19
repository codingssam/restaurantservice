var mysql = require('mysql');
var async = require('async');
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');

function findMenu(menuId, callback) {
  var sql_select_menu = 'SELECT id, name, price FROM menu WHERE id = ?';
  var sql_select_file = 'SELECT filename, filepath FROM file WHERE menu_id = ?';

  dbPool.getConnection(function(err, conn) {
    if (err) {
      return callback(err);
    }
    var menu = {};
    async.parallel([selectMenu, selectFile], function(err, results) {
      if (err) {
        conn.release();
        return callback(err);
      }
      menu.id = results[0][0].id;
      menu.name = results[0][0].name;
      menu.price = results[0][0].price;
      // results[1]에 대한 async.each 적용
      menu.originalFilename = results[1][0].filename;
      var filename = path.basename(results[1][1].filepath);
      menu.fileUrl = url.resolve('http://localhost:3000', '/images/' + filename);
      conn.release();
      callback(null, menu);
    });

    function selectMenu(callback) {
      conn.query(sql_select_menu, [menuId], function(err, results) {
        if (err) {
          return callback(err);
        }
        callback(null, results);
      });
    }

    function selectFile(callback) {
      conn.query(sql_select_file, [menuId], function(err, results) {
        if (err) {
          return callback(err);
        }
        callback(null, results);
      });
    }
  });

}

function createMenu(menu, callback) {
  var sql_insert_menu = 'INSERT INTO menu(name, price) ' +
                        'VALUES (?, ?)';
  var sql_insert_file = 'INSERT INTO file(menu_id, filename, filepath) ' +
                        'VALUES (?, ?, ?)';

  var menu_id;

  dbPool.getConnection(function (err, dbConn) {
    if (err) {
      return callback(err);
    }
    dbConn.beginTransaction(function (err) {
      if (err) {
        dbConn.release();
        return callback(err);
      }

      async.series([insertMenu, insertFile], function (err) {
        if (err) {
          return dbConn.rollback(function () {
            dbConn.release();
            callback(err);
          });
        }
        dbConn.commit(function () {
          dbConn.release();
          callback(null, menu_id);
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
  });
}

module.exports.createMenu = createMenu;
module.exports.findMenu = findMenu;