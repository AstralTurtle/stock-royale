"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var database_1 = require("./lib/database");
var market_1 = require("./lib/market");
var ws_1 = require("ws");
var mongodb_1 = require("mongodb");
var unique_username_generator_1 = require("unique-username-generator");
var types_1 = require("./types");
var users = database_1.client.db("Users").collection("Users");
var stocks = {};
var tickers = [
    "AAPL",
    "NVDA",
    "MSFT",
    "AMZN",
    "GOOGL",
    "META",
    "TSLA",
    "TSM",
    "AVGO",
    "BRK.A",
    "LLY",
    "V",
    "JNJ",
    "UNH",
    "JPM",
    "XOM",
    "MA",
    "PG",
    "NVO",
    "ORCL",
    "HD",
    "CVX",
    "MRK",
    "ASML",
    "KO",
    "PEP",
    "ABBV",
    "COST",
    "BAC",
    "ADBE",
    "TM",
    "MCD",
    "BABA",
    "CSCO",
    "BHP",
    "NVS",
    "CRM",
    "AZN",
    "PFE",
    "OR",
    "PM",
    "ABT",
    "MC",
    "DHR",
    "TXN",
    "UNP",
    "HSBC",
    "ACN",
    "GE",
    "INTC",
    "BKNG",
    "C",
    "IBM",
    "PRX",
    "BP",
    "UL",
    "T",
    "WMT",
    "SHEL",
    "601288.SS",
    "601939.SS",
    "601398.SS",
    "601857.SS",
    "RELIANCE.NS",
    "NESN.SW",
    "ROG.SW",
    "TTE",
    "1288.HK",
    "0941.HK",
    "2318.HK",
    "600519.SS",
    "600036.SS",
    "3690.HK",
    "JD",
    "PDD",
    "NPN.JO",
    "DGE.L",
    "CBA.AX",
    "BP.L",
    "SAN.PA",
    "GSK.L",
    "VOW3.DE",
    "SIE.DE",
    "SAP.DE",
    "PRX.AS",
    "OR.PA",
    "AZN.L",
    "ULVR.L",
    "HSBA.L",
    "BP.L",
    "DGE.L",
    "GSK.L",
    "SAN.PA",
    "VOW3.DE",
    "SIE.DE",
    "SAP.DE",
];
tickers.forEach(function (name) {
    var stock = (0, market_1.createStock)(name, {
        basePrice: 200,
        volatility: 0.02,
        drift: 0.0005,
        type: types_1.StockType.Stable,
    });
    stocks[name] = stock;
});
setInterval(function () {
    stocks = Object.fromEntries(Object.entries(stocks).map(function (_a) {
        var key = _a[0], stock = _a[1];
        return [key, (0, market_1.updateStockDaily)(stock)];
    }));
}, 1000);
// Create an HTTP server
var server = (0, http_1.createServer)(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WebSocket server running\n");
});
// Attach WebSocket server to the HTTP server
var wss = new ws_1.WebSocketServer({ server: server });
wss.on("connection", function (ws) {
    console.log("Client connected");
    var client_authenticated = false;
    setInterval(function () {
        users
            .find({})
            .toArray()
            .then(function (userDocs) {
            if (!userDocs) {
                return;
            }
            var updatedUsers = userDocs.map(function (_a) {
                var _id = _a._id, rest = __rest(_a, ["_id"]);
                return rest;
            }).map(function (user) {
                var net_worth = user.cash;
                Object.keys(user.portfolio).forEach(function (ticker) {
                    net_worth += user.portfolio[ticker];
                });
                return {
                    username: user.username,
                    cash: user.cash,
                    portfolio: user.portfolio,
                    net_worth: net_worth,
                };
            });
            ws.send(JSON.stringify({ users: updatedUsers }));
            var updatedStocks = Object.fromEntries(Object.entries(stocks).map(function (_a) {
                var key = _a[0], stock = _a[1];
                return [
                    key,
                    { name: stock.name, history: stock.history },
                ];
            }));
            ws.send(JSON.stringify({ stocks: updatedStocks }));
        });
    }, 1000);
    ws.onmessage = function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var data_1, userDoc_1, user_1, data, userDoc, response, user, stockTicker, stock, stockCurrent, stockShares, totalPrice, response_1, response, stockTicker, stock, stockCurrent, stockShares, totalGain, response_2, response_3, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Received: ".concat(message));
                    if (!!client_authenticated) return [3 /*break*/, 2];
                    data_1 = message.data;
                    return [4 /*yield*/, users.findOne({ uuid: data_1.uuid })];
                case 1:
                    userDoc_1 = _a.sent();
                    if (!userDoc_1) {
                        user_1 = {
                            uuid: new mongodb_1.UUID().toString(),
                            username: (0, unique_username_generator_1.generateUsername)("-"),
                            wins: 0,
                            cash: 10000,
                            portfolio: {},
                        };
                        users.insertOne(user_1);
                        console.log("Welcome, new user! uwu");
                        ws.send(JSON.stringify({ uuid: user_1.uuid }));
                        client_authenticated = true;
                        return [2 /*return*/];
                    }
                    console.log("I'VE PLAYED THESE GAMES BEFORE!");
                    ws.send(JSON.stringify({ uuid: data_1.uuid }));
                    client_authenticated = true;
                    return [2 /*return*/];
                case 2:
                    data = message.data;
                    return [4 /*yield*/, users.findOne({ uuid: data.uuid })];
                case 3:
                    userDoc = _a.sent();
                    if (!userDoc) {
                        response = {
                            type: types_1.ResponseType.Failure,
                            message: "INTRUDER ALERT! WHO ARE YOU???",
                        };
                        ws.send(JSON.stringify(response));
                        return [2 /*return*/];
                    }
                    user = {
                        uuid: userDoc.uuid,
                        username: userDoc.username,
                        wins: userDoc.wins,
                        cash: userDoc.cash,
                        portfolio: userDoc.portfolio,
                    };
                    if (data.type === types_1.RequestType.Buy) {
                        stockTicker = data.stock;
                        stock = stocks[stockTicker];
                        stockCurrent = stock.history[stock.history.length - 1].current;
                        stockShares = data.shares;
                        totalPrice = stockCurrent * stockShares;
                        if (user.cash < totalPrice) {
                            response_1 = {
                                type: types_1.ResponseType.Failure,
                                message: "You are broke.",
                            };
                            ws.send(JSON.stringify(response_1));
                            return [2 /*return*/];
                        }
                        user.cash -= totalPrice;
                        user.portfolio[stockTicker]
                            ? (user.portfolio[stockTicker] += stockShares)
                            : (user.portfolio[stockTicker] = stockShares);
                        response = {
                            type: types_1.ResponseType.Success,
                            message: "You have purchased the shares.",
                        };
                        ws.send(JSON.stringify(response));
                        return [2 /*return*/];
                    }
                    if (data.type === types_1.RequestType.Sell) {
                        stockTicker = data.stock;
                        stock = stocks[stockTicker];
                        stockCurrent = stock.history[stock.history.length - 1].current;
                        stockShares = data.shares;
                        totalGain = stockCurrent * stockShares;
                        if (!user.portfolio[stockTicker]) {
                            response_2 = {
                                type: types_1.ResponseType.Failure,
                                message: "You don't own any shares blud.",
                            };
                            ws.send(JSON.stringify(response_2));
                            return [2 /*return*/];
                        }
                        if (user.portfolio[stockTicker] < stockShares) {
                            response_3 = {
                                type: types_1.ResponseType.Failure,
                                message: "You don't own all those shares.",
                            };
                            ws.send(JSON.stringify(response_3));
                            return [2 /*return*/];
                        }
                        user.cash += totalGain;
                        user.portfolio[stockTicker] -= stockShares;
                        response = {
                            type: types_1.ResponseType.Success,
                            message: "You have sold the shares.",
                        };
                        ws.send(JSON.stringify(response));
                        return [2 /*return*/];
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    ws.onerror = function () {
        console.log("Client crash");
    };
    ws.onclose = function () {
        console.log("Client disconnected");
    };
});
// Start the server
server.listen(8080, function () {
    console.log("Server is running on http://localhost:8080");
});
