var db = require('../../data'),
    bodyParser = require('body-parser'),
		Product = require('../../data/models/product');

module.exports = function (app, callback) {

  var DEFAULT_TIME_PERIOD = 3,
    DEFAULT_PRODUCT_TYPE = 'fashion',
    DELETE_REASON_DICTIONARY = {
      0: 'not relevant',
      1: 'not interesting',
      2: 'too weird',
      3: 'other'
    };

  app.use( bodyParser.json() ); // to support JSON-encoded bodies
  // to support URL-encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true
  }));

	app.get('/', function (req, res) {
    res.render('index');
  });

	app.get('/products', function (req, res) {
    var timePeriod = req.query['time-period'] || DEFAULT_TIME_PERIOD;
    var type = req.query['type'] || DEFAULT_PRODUCT_TYPE;
    Product.getTopRated(timePeriod, type, function (err, products) {
      res.status(200).json({products: products});
    });
  });

  app.post('/products/:productId', function (req, res) {
    var productId = req.params.productId;
    var isUseful = req.body.useful;
    log('Recieved request to set product', productId, 'to usefulness', isUseful)
    Product.findOne({_id:productId}, function(err, doc){
      if ( err ) {
        return res.status(500)
      }
      doc.useful = isUseful
      doc.save(function(err, doc){
        if ( err ) {
          return res.status(500)
        }
        res.status(200).json(true);
      })
    });
  });

  app.delete('/products/:productId', function (req, res) {
    var productId = req.params.productId;
    var reason = req.body.reason;

    log('deleting product', productId, 'as it is', DELETE_REASON_DICTIONARY[reason]);

    Product.findOne({_id: productId}, function (err, doc) {
      if (err) {
        return res.status(500);
      }

      doc.deleted = true;
      doc.deleteReason = DELETE_REASON_DICTIONARY[reason];

      doc.save(function (err, doc) {
        if (err) {
          return res.status(500);
        }
        
        res.status(200).json({product: doc});
      })
    })
  });

	callback();
}