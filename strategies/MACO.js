// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};
method.currentTick = 0;
method.history = [
  {
    candle: candle,
    ema: ema,
    sma: sma,
    // resEMA: resEMA,
    // resSMA: resSMA,
    // price: price,
    // diff: diff,
  },
];

// prepare everything our method needs
method.init = function() {
  this.name = 'MACO';

  this.currentTrend;
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('ema', 'EMA', this.settings);
  this.addIndicator('sma', 'SMA', this.settings.weight);
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
  log.debug('\t Inner EMA:', ema.inner.result.toFixed(8));
  log.debug('\t Outer EMA:', ema.outer.result.toFixed(8));
  log.debug('\t EMA:', ema.result.toFixed(5));
  log.debug('\t SMA:', sma.result.toFixed(5));
  log.debug('\t EMA age:', ema.inner.age, 'candles');
}



method.haveEnoughHistory = function() {
  if(this.history.length < 5){
    return false
  }
}

method.getPrevious = function() {
  return this.history[this.currentTick-1]
}
method.greaterHistoricSMA = function(number){
  if (!this.haveEnoughHistory()) return false
};
method.greaterHistoricEMA = function(number){
  if (!this.haveEnoughHistory()) return false
};

method.check = function(candle) {
  let ema = this.indicators.ema;
  let sma = this.indicators.sma;
  let resEMA = ema.result;
  let resSMA = sma.result;
  let price = candle.close;
  let diff = resSMA - resEMA;

  _.push(this.history, {
      candle: candle,
      ema: ema,
      sma: sma,
      resEMA: resEMA,
      resSMA: resSMA,
      price: price,
      diff: diff,
    })

  this.currentTick += 1
  if (!this.haveEnoughHistory) return;
  if (sma > ema && this.greaterHistoricSMA(5)){
    this.advice('buy')
  } elseif(sma < ema && this.greaterHistoricEMA(5)) {
    this.advice('sell')
  } else {
    this.advice('hold')
  }


  let message = '@ ' + price.toFixed(8) + ' (' + resEMA.toFixed(5) + '/' + diff.toFixed(5) + ')';

  if(diff > this.settings.thresholds.up) {
    log.debug('we are currently in uptrend', message);

    if(this.currentTrend !== 'up') {
      this.currentTrend = 'up';
      this.advice('long');
    } else
      this.advice();

  } else if(diff < this.settings.thresholds.down) {
    log.debug('we are currently in a downtrend', message);

    if(this.currentTrend !== 'down') {
      this.currentTrend = 'down';
      this.advice('short');
    } else
      this.advice();

  } else {
    log.debug('we are currently not in an up or down trend', message);
    this.advice();
  }
}

module.exports = method;
