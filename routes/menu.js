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
  res.send({ message: 'show menu(' + req.params.id + ')'});
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

    // files.photos가 Array일 경우
    if (files.photos instanceof Array) {
      async.each(files.photos, function(item, done) {
        menu.files.push({
          path: item.path,
          name: item.name
        });
        done(null);
      }, function(err) {
        if (err) {
          return next(err);
        }
        Menu.createMenu(menu, function(err, result) {
          if (err) {
            return next(err);
          }
          menu.id = result;
          res.send({
            message: 'create menu with files',
            menu: menu
          });
        });
      });
    } else if (!files.photos) {
      Menu.createMenu(menu, function(err, result) {
        if (err) {
          return next(err);
        }
        menu.id = result;

        res.send({
          message: 'create menu without a file',
          menu: menu
        });
      });
    } else {
      menu.files.push({
        path: files.photos.path,
        name: files.photos.name
      });
      Menu.createMenu(menu, function(err, result) {
        if (err) {
          return next(err);
        }
        menu.id = result;
        res.send({
          message: 'create menu with a file',
          menu: menu
        });
      });
    }
  });
});

router.put('/:id', function(req, res, next) {
  res.send({ message: 'update menu(' + req.params.id + ')' });
});

router.delete('/:id', function(req, res, next) {
  res.send({ message: 'delete menu(' + req.params.id + ')' });
});

module.exports = router;


