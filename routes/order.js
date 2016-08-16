var express = require('express');
var router = express.Router();
var Order = require('../models/order');

// 주문 목록 조회, GET /orders
router.get('/', function(req, res, next) {
  var data = {};
  var message = '';
  var results = [];

  if (req.url.match(/\/\?pageNo=\d+&rowCount=\d+/i)) { // 주문 목록 조회 req.url: /?pageNo=1&rowCount=10
    message = 'list orders';
    var pageNo = parseInt(req.query.pageNo, 10);
    var rowCount = parseInt(req.query.rowCount, 10);

    Order.listOrders(pageNo, rowCount, function(err, orders) {
      if (err) {
        return next(err);
      }
      data.results = orders;
      res.send({
        message: message,
        data: data
      });
    });
  } else {
    var startdate = req.query.startdate;
    var enddate = req.query.enddate;
    var menus = req.query.menus;

    // 일자별 주문 검색
    if (startdate) {
      message = 'search orders with dates';
      if (startdate === enddate || !enddate) { // 특정 일자 검색
        results.push({

        });
      } else { // 특정 기간 검색
        results.push({

        });
      }
      data.startdate = startdate;
      data.enddate = enddate;
      data.results = results;
    }

    // 메뉴별 주문 검색
    if (menus) {
      message = 'search orders with menus';
      results.push({

      });
      data.menus = menus;
      data.results = results;
    }
  }
});

// 주문 생성, POST /orders
router.post('/', function(req, res, next) {
  var newOrder = {};
  newOrder.branch_id = req.body.branch_id;
  newOrder.customer_id = req.body.customer_id;
  newOrder.details = [];
  for (var i = 0; i < req.body.branch_menu_ids.length; i++) {
    newOrder.details.push({
      branch_menu_id: req.body.branch_menu_ids[i],
      quantity: req.body.quantities[i]
    });
  }

  Order.placeOrder(newOrder, function(err, result) {
    if (err) {
      return next(err);
    }
    res.send({
      message: 'order no: ' + result.id,
      result: {
        order: {
          id: result.id,
          customer_id: result.customer_id,
          branch_id: result.branch_id,
          order_dtime: result.order_dtime
        },
        details: result.details
      }
    });
  });
});

// 주문 조회, GET /orders/:oid
router.get('/:oid', function(req, res, next) {
  var oid = req.params.oid;

  Order.showOrderDetails(oid, function(err, results) {
    if (err) {
      return next(err);
    }
    res.send({
      message: req.params.oid + ', read order',
      result: {
        details: results
      }});
  });
});

// 주문 변경, PUT /orders/:oid
router.put('/:oid', function(req, res, next) {
  var oid = req.params.oid;
  var details = [];
  for (var i = 0; i < req.body.branch_menu_ids.length; i++) {
    details.push({
      branch_menu_id: req.body.branch_menu_ids[i],
      quantity: req.body.quantities[i]
    });
  }
  Order.updateOrderDetails(oid, details, function(err, result) {
    if (err) {
      return next(err);
    }

    res.send({
      message: req.params.oid + ', update order',
      result: {
        changedRows: result
      }
    });
  });

});

module.exports = router;