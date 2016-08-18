var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var Menu = require('../models/menu');
var async = require('async');

router.get('/', function(req, res, next) {
  res.send({ message: 'list menus' });
});

router.get('/:id', function(req, res, next) {
  var menuId = req.params.id;
  Menu.findMenu(menuId, function(err, menu) {
    if (err) {
      return next(err);
    }
    res.send({
      message: 'show menu(' + req.params.id + ')',
      menu: menu
    });
  })
});

router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '../uploads/images/menus');
  form.keepExtensions = true;
  form.multiples = true;
  form.parse(req, function(err, fields, files) {
    if (err) {
      return next(err);
    }
    var menu = {};
    menu.name = fields.menu_name;
    menu.price = parseInt(fields.price, 10);
    menu.files = [];
    if (files.photos instanceof Array) {
      menu.files = files.photos;
    } else if (files.photos) {
      menu.files.push(files.photos);
    }
    Menu.createMenu(menu, function(err, result) {
      if (err) {
        return next(err);
      }
      menu.id = result;
      res.send({
        message: 'create menu',
        menu: menu
      });
    });
  });
});

router.put('/:id', function(req, res, next) {
  res.send({ message: 'update menu(' + req.params.id + ')' });
});

router.delete('/:id', function(req, res, next) {
  res.send({ message: 'delete menu(' + req.params.id + ')' });
});

module.exports = router;


