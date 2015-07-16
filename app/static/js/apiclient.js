define(['vnd/superagent'], function(superagent){

  var getProducts = function(days, type, cb){
    superagent
      .get('/products')
      .query({ 'time-period': days })
      .query({ 'type': type })
      .set({
        'accept': 'application/json'
      })
      .end(function(res){
        if ( cb ) {
          cb(res)
        }
      })
  }

  var updateProductUsefulness = function(productId, isUseful, cb){
    superagent
      .post('/products/'+productId)
      .send({useful: isUseful})
      .set({
        'accept': 'application/json'
      })
      .end(function(res){
        if ( cb ) {
          cb(res)
        }
      })
  }

  var removeProduct = function (productId, reason, cb) {
    superagent
      .del('/products/'+productId)
      .send({reason: reason})
      .set({
        'accept': 'application/json'
      })
      .end(function(res){
        if (cb) {
          cb(res);
        }
      })
  }

  return {
    getProducts: getProducts,
    updateProductUsefulness: updateProductUsefulness,
    removeProduct: removeProduct
  }
})