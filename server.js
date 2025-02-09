"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var market_1 = require("./lib/market");
var ws_1 = require("ws");
var mongodb_1 = require("mongodb");
var unique_username_generator_1 = require("unique-username-generator");
var types_1 = require("./types");
//const users = client.db("Users").collection<User>("Users");
var usrs = [];
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
    console.log("Updating stocks!");
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
    var user = {
        uuid: new mongodb_1.UUID(),
        username: (0, unique_username_generator_1.generateUsername)("-"),
        wins: 0,
        cash: 10000,
        portfolio: {},
    };
    //users.insertOne(user);
    usrs.push(user);
    ws.send(JSON.stringify({
        message: "This is your UUID, please don't lose it!",
        uuid: user.uuid,
    }));
    /*
    setInterval(() => {
      users
        .find({})
        .toArray()
        .then((userDocs) => {
          if (!userDocs) {
            console.log("User not found");
            return;
          }
  
          const formattedUsers: User[] = userDocs.map(({ _id, ...rest }) => rest);
  
          const body: Report = {
            stocks: stocks,
            users: formattedUsers,
          };
  
          ws.send(JSON.stringify(body));
        });
    }, 1000);
    */
    setInterval(function () {
        var body = {
            stocks: stocks,
            users: usrs,
        };
        ws.send(JSON.stringify(body));
    }, 1000);
    ws.onmessage = function (message) {
        console.log("Received: ".concat(message));
        var data = message.data;
        usrs.forEach(function (user) {
            if (user.uuid != new mongodb_1.UUID(data.uuid))
                return;
            if (data.type === types_1.RequestType.Buy) {
                var stockTicker = data.stock;
                var stock = stocks[stockTicker];
                var stockCurrent = stock.history[stock.history.length - 1].current;
                var stockShares = data.shares;
                var totalPrice = stockCurrent * stockShares;
                if (user.cash < totalPrice) {
                    var response_1 = {
                        type: types_1.ResponseType.Failure,
                        message: "You are broke.",
                    };
                    ws.send(JSON.stringify(response_1));
                    return;
                }
                user.cash -= totalPrice;
                user.portfolio[stockTicker] += stockShares;
                var response = {
                    type: types_1.ResponseType.Success,
                    message: "You have purchased the shares.",
                };
                ws.send(JSON.stringify(response));
                return;
            }
            if (data.type === types_1.RequestType.Sell) {
                var stockTicker = data.stock;
                var stock = stocks[stockTicker];
                var stockCurrent = stock.history[stock.history.length - 1].current;
                var stockShares = data.shares;
                var totalGain = stockCurrent * stockShares;
                if (user.portfolio[stockTicker] < stockShares) {
                    var response_2 = {
                        type: types_1.ResponseType.Failure,
                        message: "You don't own all those shares.",
                    };
                    ws.send(JSON.stringify(response_2));
                    return;
                }
                user.cash += totalGain;
                user.portfolio[stockTicker] -= stockShares;
                var response = {
                    type: types_1.ResponseType.Success,
                    message: "You have sold the shares.",
                };
                ws.send(JSON.stringify(response));
                return;
            }
        });
        /*
        users.findOne({ uuid: new UUID(data.uuid) }).then((userDoc) => {
          if (!userDoc) {
            console.log("User not found");
            return;
          }
    
          const user: User = {
            uuid: userDoc.uuid!,
            username: userDoc.username!,
            wins: userDoc.wins!,
            cash: userDoc.cash!,
            portfolio: userDoc.portfolio!,
          };
    
          if (data.type === RequestType.Buy) {
            const stockTicker = (data as BuyRequest).stock;
            const stock = stocks[stockTicker];
            const stockCurrent = stock.history[stock.history.length - 1].current;
            const stockShares = (data as BuyRequest).shares;
            const totalPrice = stockCurrent * stockShares;
    
            if (user.cash < totalPrice) {
              const response: Response = {
                type: ResponseType.Failure,
                message: "You are broke.",
              };
              ws.send(JSON.stringify(response));
              return;
            }
    
            user.cash -= totalPrice;
            user.portfolio[stockTicker] += stockShares;
    
            const response: Response = {
              type: ResponseType.Success,
              message: "You have purchased the shares.",
            };
            ws.send(JSON.stringify(response));
            return;
          }
    
          if (data.type === RequestType.Sell) {
            const stockTicker = (data as SellRequest).stock;
            const stock = stocks[stockTicker];
            const stockCurrent = stock.history[stock.history.length - 1].current;
            const stockShares = (data as SellRequest).shares;
            const totalGain = stockCurrent * stockShares;
    
            if (user.portfolio[stockTicker] < stockShares) {
              const response: Response = {
                type: ResponseType.Failure,
                message: "You don't own all those shares.",
              };
              ws.send(JSON.stringify(response));
              return;
            }
    
            user.cash += totalGain;
            user.portfolio[stockTicker] -= stockShares;
    
            const response: Response = {
              type: ResponseType.Success,
              message: "You have sold the shares.",
            };
            ws.send(JSON.stringify(response));
            return;
          }
        });
        */
    };
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
