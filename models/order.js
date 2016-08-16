var mysql = require('mysql');
var async = require('async');
var dbConfig = require('../config/dbConfig');

function placeOrder(orderObj, callback) {
  var sql_insert_menu_order = 'INSERT INTO menu_order(branch_id, customer_id) ' +
    'VALUES(?, ?)';
  var sql_insert_menu_order_details = 'INSERT INTO menu_order_details(menu_order_id, branch_menu_id, quantity, menu_price) ' +
    'VALUES(?, ?, ?, ?)';
  var sql_select_menu_price = 'SELECT m.price ' +
    'FROM branch_menu bm JOIN menu m ON(bm.menu_id = m.id) ' +
    'WHERE bm.id = ?';
  var sql_select_menu_order_dtime = 'SELECT date_format(convert_tz(mo.order_dtime, \'+00:00\', \'+09:00\'), \'%Y-%m-%d %H:%i:%s\') odtime ' +
    'FROM menu_order mo ' +
    'WHERE mo.id = ? ';

  var dbConn = mysql.createConnection(dbConfig);
  dbConn.beginTransaction(function (err) {
    if (err) {
      return callback(err);
    }
    async.series([insertMenuOrder, insertMenuOrderDetailsEach], function (err) {
      if (err) {
        return dbConn.rollback(function () {
          callback(err);
          dbConn.end();
        });
      }
      dbConn.commit(function () {
        callback(null, orderObj);
        dbConn.end();
      })
    });
  });

  function insertMenuOrder(callback) {
    dbConn.query(sql_insert_menu_order, [orderObj.branch_id, orderObj.customer_id], function (err, result) {
      if (err) {
        return callback(err);
      }
      console.log('result.insertId: ' + result.insertId);
      orderObj.id = result.insertId;
      selectMenuOrderDtime(orderObj.id, function (err, result) {
        if (err) {
          return callback(err);
        }
        orderObj.order_dtime = result;
        callback(null);
      });
    });
  }

  function insertMenuOrderDetailsEach(callback) {
    async.each(orderObj.details, function (item, done) {
      insertMenuOrderDetails(orderObj.id, item, done);
    }, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }

  function insertMenuOrderDetails(id, item, callback) {
    selectMenuPrice(item.branch_menu_id, function (err, price) {
      if (err) {
        return callback(err);
      }
      item.menu_price = price;
      dbConn.query(sql_insert_menu_order_details,
        [id, item.branch_menu_id, item.quantity, item.menu_price], function (err, result) {
          if (err) {
            return callback(err);
          }
          callback(null);
        });
    });
  }

  function selectMenuPrice(branch_menu_id, callback) {
    dbConn.query(sql_select_menu_price, [branch_menu_id], function (err, results) {
      if (err) {
        return callback(err);
      }
      callback(null, results[0].price);
    });
  }

  function selectMenuOrderDtime(menu_order_id, callback) {
    dbConn.query(sql_select_menu_order_dtime, [menu_order_id], function (err, results) {
      if (err) {
        return callback(err);
      }
      callback(null, results[0].odtime);
    });
  }

}

function listOrders(pageNo, rowCount, callback) {
  var sql = 'SELECT mo.id moid, ' +
    'date_format(convert_tz(mo.order_dtime, ?, ?), \'%Y-%m-%d %H:%i:%s\') motime, ' +
    'b.name bname, ' +
    'c.name cname, ' +
    'sum(md.menu_price * md.quantity) total_price ' +
    'FROM menu_order_details md JOIN menu_order mo ON (md.menu_order_id = mo.id) ' +
    'JOIN branch b ON (mo.branch_id = b.id) ' +
    'JOIN customer c ON (mo.customer_id = c.id) ' +
    'GROUP BY mo.id ' +
    'ORDER BY mo.id DESC ' +
    'LIMIT ?, ?';

  var dbConn = mysql.createConnection(dbConfig);
  dbConn.query(sql, ["+00:00", "+09:00", rowCount * (pageNo - 1), rowCount], function (err, results) {
    if (err) {
      dbConn.end();
      return callback(err);
    }
    callback(null, results);
    dbConn.end();
  });
}

function showOrderDetails(orderId, callback) {
  var sql_select_menu_order_details = 'SELECT m.name, m.price, md.quantity, m.price * md.quantity total_price ' +
    'FROM menu_order_details md JOIN branch_menu bm ON (md.branch_menu_id = bm.id) ' +
    'JOIN menu m ON (bm.menu_id = m.id) ' +
    'WHERE menu_order_id = ?';

  var dbConn = mysql.createConnection(dbConfig);
  dbConn.query(sql_select_menu_order_details, [orderId], function (err, results) {
    if (err) {
      dbConn.end();
      return callback(err);
    }
    callback(null, results);
    dbConn.end();
  });
}

function updateOrderDetails(orderId, details, callback) {
  // quantity, menu_order_id, branch_menu_id
  var sql_update_menu_order_details = "update menu_order_details " +
                                      "set  quantity = ? " +
                                      "where menu_order_id = ? and branch_menu_id = ?";
  var dbConn = mysql.createConnection(dbConfig);
  var changedRows = 0;

  dbConn.beginTransaction(function(err) {
    if (err) {
      return callback(err);
    }
    async.each(details, function(item, done) {
      dbConn.query(sql_update_menu_order_details,
        [item.quantity, orderId, item.branch_menu_id], function(err, result) {
        if (err) {
          return done(err);
        }
        changedRows += result.changedRows;
        done(null);
      });
    }, function(err) {
      if (err) {
        return dbConn.rollback(function() {
          callback(err);
          dbConn.end();
        });
      }
      dbConn.commit(function() {
        callback(null, changedRows);
        dbConn.end();
      });
    })

  });

}

module.exports.placeOrder = placeOrder;
module.exports.listOrders = listOrders;
module.exports.showOrderDetails = showOrderDetails;
module.exports.updateOrderDetails = updateOrderDetails;