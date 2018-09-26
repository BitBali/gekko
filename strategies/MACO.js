// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};
method.currentTick = 0;
method.history = [];
method.averageConfirmationNumber = 5

// prepare everything our method needs
method.init = function() {
  this.name = 'MACO';

  this.currentTrend;
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('ema', 'EMA', this.settings);
  this.addIndicator('sma', 'SMA', this.settings.weight);
}

const areAll = function(coll, func) {
  return _.filter(coll, func).length == coll.length
}




// what happens on every new candle?
method.update = function(candle) {
  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
  let ema = this.indicators.ema;
  let sma = this.indicators.sma;

  log.debug('Calculated EMA and SMA properties for candle:');
  // log.debug('\t Inner EMA:', ema.inner.result.toFixed(8));
  // log.debug('\t Outer EMA:', ema.outer.result.toFixed(8));
  // log.debug('\t EMA:', ema.result.toFixed(5));
  // log.debug('\t SMA:', sma.result.toFixed(5));
  // log.debug('\t EMA age:', ema.inner.age, 'candles');
}

method.haveEnoughHistory = function() {
  if(this.history.length < this.averageConfirmationNumber){
    return false
  }
}

method.lastHistory = function(amount = null) {
  var number = amount || this.averageConfirmationNumber
  if(!this.haveEnoughHistory) { return [] }
  return _.takeRight(this.history, number)
}

method.getPrevious = function() {
  return this.history[this.currentTick-1]
}
method.greaterHistoricSMA = function(){
  if (!this.haveEnoughHistory()) return false
  return areAll(this.lastHistory(), (e) => { return e.sma > e.ema })
};
method.greaterHistoricEMA = function(number = null){
  if (!this.haveEnoughHistory()) return false
  return areAll(this.lastHistory(), (e) => { return e.ema > e.sma })
};

method.check = function(candle) {

  let ema = this.indicators.ema;
  let sma = this.indicators.sma;
  let resEMA = ema.result;
  let resSMA = sma.result;
  let price = candle.close;
  let diff = resSMA - resEMA;

  this.history.push({
    candle: candle,
    ema: ema,
    sma: sma,
    resEMA: resEMA,
    resSMA: resSMA,
    price: price,
    diff: diff,
  })

  this.currentTick += 1

  let message = '@ ' + price.toFixed(8) + ' (' + resEMA.toFixed(5) + '/' + diff.toFixed(5) + ')';

  if (!this.haveEnoughHistory) {
    log.debug('We do not have enought history yet', message);
    this.advice()
  } else if (sma > ema && this.greaterHistoricSMA()) {
    log.debug('we are currently in uptrend', message);
    this.advice('long')
  } else if(sma < ema && this.greaterHistoricEMA()) {
    log.debug('we are currently in a downtrend', message);
    this.advice('short')
  } else {
    log.debug('we are currently not in an up or down trend', message);
    this.advice()
  }
}

module.exports = method;
