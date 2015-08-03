// server/api/item/item.controller.js


// Get list of items
exports.index = function(req, res) {
  Item.loadRecent(function (err, items) {
    if(err) { return handleError(res, err); }
    return res.json(200, items);
  });
};

// Creates a new item in the DB.
exports.create = function(req, res) {
  // don't include the date, if a user specified it
  delete req.body.date;

  var item = new Item(_.merge({ author: req.user._id }, req.body));
  item.save(function(err, item) {
    if(err) { return handleError(res, err); }
    return res.json(201, item);
  });
};