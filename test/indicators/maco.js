var chai = require('chai');
var expect = chai.expect;
var should = chai.should;
var sinon = require('sinon');

var _ = require('lodash');

var util = require('../../core/util');
var dirs = util.dirs();
var INDICATOR_PATH = dirs.indicators;

// Fake input prices to verify all indicators
// are working correctly by comparing fresh
// calculated results to pre calculated results.

// The precalculated results are already compared
// to MS Excel results, more info here:
//
// https://github.com/askmike/gekko/issues/161

var prices = [81, 24, 75, 21, 34, 25, 72, 92, 99, 2, 86, 80, 76, 8, 87, 75, 32, 65, 41, 9, 13, 26, 56, 28, 65, 58, 17, 90, 87, 86, 99, 3, 70, 1, 27, 9, 92, 68, 9];
var up_down = [
  81,
  24,//sell
  75,
  21,
  34,
  25,
  72,
  92,
  99,
  2,
  86,
  80,
  76,
  8,
  87,
  75,
  32,
  65,
  41,
  9,
  13,
  26,
  56,
  28,
  65,
  58,
  17,
  90,
  87,
  86,
  99,
  3,
  70,
  1,
  27,
  9,
  92,
  68,
  9];

describe('indicators/MACO', function() {

  var EMA = require(INDICATOR_PATH + 'MACO');

  var verified_ema10results = [81,70.63636363636363,71.4297520661157,62.26070623591284,57.12239601120141,51.28196037280115,55.04887666865549,61.767262728899944,68.53685132364541,56.43924199207351,61.81392526624197,65.12048430874341,67.09857807079005,56.35338205791913,61.92549441102474,64.30267724538388,58.42946320076862,59.624106255174325,56.2379051178699,47.649195096439,41.349341442541004,38.55855208935173,41.72972443674232,39.233410902789174,43.91824528410023,46.47856432335473,41.118825355472055,50.00631165447713,56.73243680820856,62.053811933988825,68.77130067326358,56.81288236903384,59.21054012011859,48.626805552824294,44.69465908867441,38.204721072551784,47.985680877542364,51.62464799071648,43.874711992404386];
  // var verified_ema12results = [81,72.23076923076923,72.65680473372781,64.709604005462,59.98504954308323,54.602734228762735,57.27923665510693,62.620892554321244,68.2176783151949,58.030343189780304,62.33336731442949,65.05131080451726,66.73572452689922,57.69945921506857,62.20723472044264,64.17535245575915,59.2252982317962,60.11371388844294,57.173142520990176,49.761889825453224,44.10621446769119,41.320643011123316,43.57900562479665,41.182235528674084,44.84650698580115,46.87012129567789,42.27471801941975,49.61706909335518,55.368289232839,60.080860120094535,66.06842010161846,56.365586239831,58.46318835678008,49.62269784035237,46.14228278799047,40.42808543599194,48.36222613814702,51.383422116893634,44.86289563737154];
  // var verified_ema26results = [81,76.77777777777777,76.64609053497942,72.52415790275873,69.67051657662846,66.36158942280413,66.77924946555937,68.64745320885127,70.89579000819562,65.79239815573669,67.28925755160805,68.2307940292667,68.80629076783954,64.30212108133291,65.98344544567863,66.65133837562836,64.08457257002625,64.15238200928357,62.43739074933664,58.479065508645036,55.11024584133799,52.95393133457221,53.17956605052982,51.314413009749835,52.32816019421281,52.748296476122974,50.10027451492868,53.05580973604507,55.57019420004173,57.82425388892753,60.874309156414384,56.58732329297628,57.58085490090396,53.38968046379996,51.4348893183333,48.29156418364194,51.52922609596476,52.74928342218959,49.50859576128666];
  //

 // down sell
 // up buy
 // only when direction change
 // Five candles for confirmation, 3 before 2 after
  var verified_SMA10results = [ 81, 52.5, 60, 50.25, 47, 43.333333333333336, 47.42857142857143, 53, 58.111111111111114, 52.5, 53, 58.6, 58.7, 57.4, 62.7, 67.7, 63.7, 61, 55.2, 55.9, 48.6, 43.2, 41.2, 43.2, 41, 39.3, 37.8, 40.3, 44.9, 52.6, 61.2, 58.9, 60.3, 57.6, 53.8, 48.9, 56.4, 54.2, 46.4 ];
  // var verified_SMA12results = [ 81, 52.5, 60, 50.25, 47, 43.333333333333336, 47.42857142857143, 53, 58.111111111111114, 52.5, 55.54545454545455, 57.583333333333336, 57.166666666666664, 55.833333333333336, 56.833333333333336, 61.333333333333336, 61.166666666666664, 64.5, 61.916666666666664, 55, 47.833333333333336, 49.833333333333336, 47.333333333333336, 43, 42.083333333333336, 46.25, 40.416666666666664, 41.666666666666664, 46.25, 48, 52.833333333333336, 52.333333333333336, 57.083333333333336, 55, 52.583333333333336, 51, 53.25, 54.083333333333336, 53.416666666666664 ];
  // var verified_SMA26results = [ 81, 52.5, 60, 50.25, 47, 43.333333333333336, 47.42857142857143, 53, 58.111111111111114, 52.5, 55.54545454545455, 57.583333333333336, 59, 55.357142857142854, 57.46666666666667, 58.5625, 57, 57.44444444444444, 56.578947368421055, 54.2, 52.23809523809524, 51.04545454545455, 51.26086956521739, 50.291666666666664, 50.88, 51.15384615384615, 48.69230769230769, 51.23076923076923, 51.69230769230769, 54.19230769230769, 56.69230769230769, 55.84615384615385, 55.76923076923077, 52.26923076923077, 49.5, 49.76923076923077, 50, 49.53846153846154, 46.96153846153846 ];


  it('should correctly calculate EMAs with weight 10', function() {
    var ema = new EMA(10);
    _.each(prices, function(p, i) {
      ema.update(p);
      expect(ema.result).to.equal(verified_ema10results[i]);
    });
  });

  it('should correctly calculate EMAs with weight 12', function() {
    var ema = new EMA(12);
    _.each(prices, function(p, i) {
      ema.update(p);
      expect(ema.result).to.equal(verified_ema12results[i]);
    });
  });

  it('should correctly calculate EMAs with weight 26', function() {
    var ema = new EMA(26);
    _.each(prices, function(p, i) {
      ema.update(p);
      expect(ema.result).to.equal(verified_ema26results[i]);
    });
  });

});
