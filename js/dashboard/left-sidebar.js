/*!
 * Iguana dashboard/left-sidebar
 *
 */

var accountCoinRepeaterTemplate = '<div class=\"item{{ active }}\" data-coin-id=\"{{ coin_id }}\">' +
                                    '<div class=\"coin\">' +
                                      '<i class=\"icon cc {{ id }}-alt\"></i>' +
                                      '<span class=\"name\">{{ name }}</span>' +
                                    '</div>' +
                                    '<div class=\"balance\">' +
                                      '<div class=\"coin-value\"><span class=\"val\">{{ coin_value }}</span> {{ coin_id }}</div>' +
                                      '<div class=\"currency-value\"><span class=\"val\">{{ currency_value }}</span> {{ currency_name }}</div>' +
                                    '</div>' +
                                  '</div>';

var coinBalances = [];

function constructAccountCoinRepeater() {
  var api = new apiProto(),
  localStorage = new localStorageProto();

  // TODO: investigate why coinsInfo[key].connection === true is failing on port poll
  var index = 0;
  for (var key in coinsInfo) {
    if ((isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
      coinsSelectedByUser[index] = key;
      index++;
    }
  };

  if (coinsSelectedByUser.length === 0) helperProto.prototype.logout();

  coinBalances = [];

  for (var i=0; i < coinsSelectedByUser.length; i++) {
    api.getBalance(defaultAccount, coinsSelectedByUser[i], constructAccountCoinRepeaterCB);
  }
}

// construct account coins array
function constructAccountCoinRepeaterCB(balance, coin) {
  var result = '',
      localStorage = new localStorageProto(),
      helper = new helperProto(),
      accountCoinRepeaterHTML = '',
      api = new apiProto(),
      isActiveCoinSet = accountCoinRepeaterHTML.indexOf('item active') > -1 ? true : false;

  api.checkBackEndConnectionStatus();

  coinBalances[coin] = balance;

  var i = 0;
  for (var key in coinsInfo) {
    if (accountCoinRepeaterHTML.indexOf('data-coin-id=\"' + key + '\"') === -1 && coinBalances[key] >= 0) {

      var coinLocalRate = 0,
          api = new apiProto(),
          coinBalance = coinBalances[key] || 0; //api.getBalance(defaultAccount, coinsSelectedByUser[i]) || 0;

      //if (key.toUpperCase() !== defaultCoin)
      coinLocalRate = updateRates(key.toUpperCase(), defaultCurrency, true) || 0;

      var currencyCalculatedValue = coinBalance * coinLocalRate,
          coinData = getCoinData(key);

      if ((i === 0 && !isActiveCoinSet) && !activeCoin) activeCoin = coinData.id;
      if (coinData)
        i++;
        result += accountCoinRepeaterTemplate.
                  replace('{{ id }}', coinData.id.toUpperCase()).
                  replace('{{ name }}', coinData.name).
                  replace('{{ coin_id }}', coinData.id.toLowerCase()).
                  replace('{{ coin_id }}', coinData.id.toUpperCase()).
                  replace('{{ currency_name }}', defaultCurrency).
                  replace('{{ coin_value }}', coinBalance ? coinBalance.toFixed(helper.decimalPlacesFormat(coinBalance).coin) : 0).
                  replace('{{ currency_value }}', currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency)).
                  replace('{{ active }}', activeCoin === coinData.id ? ' active' : '');
    }
  }

  /* ! not efficient ! */
  $('.account-coins-repeater').html(result);
  bindClickInAccountCoinRepeater();
  if (activeCoin === getCoinData(coin).id) constructTransactionUnitRepeater();
  updateTotalBalance();
  updateTransactionUnitBalance();

  // disable send button if ther're no funds on a wallet
  if (Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()) <= 0) {
    $('.transactions-unit .action-buttons .btn-send').addClass('disabled');
  } else {
    $('.transactions-unit .action-buttons .btn-send').removeClass('disabled');
  }
}

function updateAccountCoinRepeater() {
  $('.account-coins-repeater .item').each(function(index, item) {
    var helper = new helperProto(),
        coin = $(this).attr('data-coin-id'),
        coinValue = $(this).find('.coin-value .val'),
        currencyValue = $(this).find('.currency-value .val'),
        currenyValueCalculated = (Number(coinValue.html()) * updateRates(coin.toUpperCase(), null, true));

    currencyValue.html(Number(currenyValueCalculated) ? currenyValueCalculated.toFixed(helper.decimalPlacesFormat(currenyValueCalculated).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency));
  });
}

function bindClickInAccountCoinRepeater() {
  var localStorage = new localStorageProto();

  $('.account-coins-repeater .item').each(function(index, item) {
    $(this).click(function() {
      $('.account-coins-repeater .item').filter(':visible').removeClass('active');

      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      } else {
        var oldActiveCoinVal = activeCoin;

        $(this).addClass('active');
        activeCoin = $(this).attr('data-coin-id');
        localStorage.setVal('iguana-active-coin', { id: activeCoin });

        if (oldActiveCoinVal !== activeCoin) {
          updateTransactionUnitBalance();
          constructTransactionUnitRepeater();
          //$('.transactions-list-repeater').html(constructTransactionUnitRepeater());
        }
      }
    });
  });
}