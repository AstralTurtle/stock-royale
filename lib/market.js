"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyStockPrice = modifyStockPrice;
exports.initalizeStockPrice = initalizeStockPrice;
exports.createStock = createStock;
exports.updateStockDaily = updateStockDaily;
var types_1 = require("../types");
function modifyStockPrice(previousClose, mu, sigma, k) {
    if (mu === void 0) { mu = 0.0005; }
    if (sigma === void 0) { sigma = 0.02; }
    if (k === void 0) { k = 3; }
    var generateGaussian = function (mean, stdDev) {
        var u = 0, v = 0;
        while (u === 0)
            u = Math.random();
        while (v === 0)
            v = Math.random();
        return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev +
            mean);
    };
    var openPrice = previousClose;
    var dailyReturn = generateGaussian(mu, sigma);
    var closePrice = openPrice * (1 + dailyReturn);
    var trueRange = k * sigma * openPrice;
    var movement = Math.abs(closePrice - openPrice);
    var remainingRange = Math.max(trueRange - movement, 0);
    var a = Math.random();
    var high, low;
    if (closePrice > openPrice) {
        high = closePrice + a * remainingRange;
        low = openPrice - (1 - a) * remainingRange;
    }
    else {
        high = openPrice + a * remainingRange;
        low = closePrice - (1 - a) * remainingRange;
    }
    low = Math.max(low, 0.01);
    high = Math.max(high, low + 0.01);
    return {
        open: parseFloat(openPrice.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        current: parseFloat(closePrice.toFixed(2)),
        close: parseFloat(closePrice.toFixed(2)),
    };
}
function initalizeStockPrice(config) {
    switch (config.type) {
        case types_1.StockType.Growth:
            return Math.max(10, config.basePrice * (0.8 + Math.random() * 0.4));
        case types_1.StockType.Volatile:
            return config.basePrice * (0.5 + Math.random());
        default:
            return config.basePrice * (0.9 + Math.random() * 0.2);
    }
}
function createStock(name, config) {
    var initialPrice = initalizeStockPrice(config);
    return {
        name: name,
        previousClose: initialPrice,
        history: [],
        config: config,
    };
}
function updateStockDaily(stock) {
    var newPrices = modifyStockPrice(stock.previousClose, stock.config.drift, stock.config.volatility);
    var updatedStock = __assign(__assign({}, stock), { previousClose: newPrices.close, history: __spreadArray(__spreadArray([], stock.history.slice(-7), true), [newPrices], false) });
    updatedStock = applyStockSplits(updatedStock);
    updatedStock = preventPennyStock(updatedStock);
    return updatedStock;
}
function applyStockSplits(stock) {
    if (stock.previousClose > 50000) {
        return __assign(__assign({}, stock), { previousClose: stock.previousClose / 2, history: stock.history.map(function (prices) { return ({
                open: prices.open / 2,
                high: prices.high / 2,
                low: prices.low / 2,
                close: prices.close / 2,
                current: prices.current / 2,
            }); }) });
    }
    return stock;
}
function preventPennyStock(stock) {
    if (stock.previousClose < 1) {
        return __assign(__assign({}, stock), { previousClose: 1, history: stock.history.map(function (prices) { return ({
                open: Math.max(prices.open, 1),
                high: Math.max(prices.high, 1),
                low: Math.max(prices.low, 1),
                close: Math.max(prices.close, 1),
                current: Math.max(prices.current, 1),
            }); }) });
    }
    return stock;
}
// ----------------------------
// Example Usage
// ----------------------------
/*
// Create a sample stock
const techStock = createStock("TechCo", {
    type: 'growth',
    basePrice: 100,
    volatility: 0.03,
    drift: 0.001
});

// Simulate 10 days
let currentStock = techStock;
for(let day = 1; day <= 10; day++) {
    currentStock = updateStockDaily(currentStock);
    console.log(`Day ${day}:`, currentStock.history[currentStock.history.length - 1]);
}

// Generate intraday prices
const intradayPrices = generateStockPrices(100);
intradayPrices.current = intradayPrices.low + Math.random() * (intradayPrices.high - intradayPrices.low);
console.log("Intraday prices:", intradayPrices);
*/
