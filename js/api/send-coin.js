/*!
 * Iguana api/send-coin
 *
 */

// TODO: merge wallet unlock/lock into sendtoaddress
//       prevent consequent send tx
apiProto.prototype.sendToAddress = function(coin, sendInfo, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('sendtoaddress', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('sendtoaddress', '\"' + sendInfo.address + '\", ' + sendInfo.amount + ', \"' + sendInfo.note + '\"', coin);
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);

      if (apiProto.prototype.errorHandler(response, coin) === -13)
        if (dev.showConsoleMessages && dev.isDev) console.log('unlock the wallet first');

      if (cb) cb.call(this, false);
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response, coin) !== 10) {
      if (dev.showConsoleMessages && dev.isDev) console.log(_response);

      if (_response.result) {
        // non-iguana
        if (_response.result.length) result = _response.result;
        else result = false;

      } else {
        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
          result = false;

        } else {
          if (response.result.length) result = response.result;
          else result = false;
        }
      }
    }

    if (cb) cb.call(this, result);
  });

  return result;
}

apiProto.prototype.setTxFee = function(coin, fee, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('settxfee', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('settxfee', '\"' + fee + '\"', coin);
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);

      // do something

      if (cb) cb.call(this, false);
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response, coin) !== 10) {
      if (dev.showConsoleMessages && dev.isDev) console.log(_response);

      if (_response.result) {
        // non-iguana
        if (_response.result.length) result = _response.result;
        else result = false;

      } else {
        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
          result = false;

        } else {
          if (response.result.length) result = response.result;
          else result = false;
        }
      }
    }

    if (cb) cb.call(this, result);
  });

  return result;
}