import { createServer } from "http";
import { client } from "./lib/database";
import { createStock, updateStockDaily } from "./lib/market";
import { WebSocketServer } from "ws";
import { UUID } from "mongodb";
import { generateUsername } from "unique-username-generator";
import {
  Stock,
  StockType,
  Request,
  RequestType,
  Response,
  BuyRequest,
  ResponseType,
  SellRequest,
  Report,
  User,
  LoginRequest,
  LoginResponse,
} from "./types";

const users = client.db("Users").collection("Users");
let stocks: { [key: string]: Stock } = {};

const tickers = [
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

tickers.forEach((name) => {
  const stock = createStock(name, {
    basePrice: 200,
    volatility: 0.02,
    drift: 0.0005,
    type: StockType.Stable,
  });

  stocks[name] = stock;
});

setInterval(() => {
  stocks = Object.fromEntries(
    Object.entries(stocks).map(([key, stock]) => [key, updateStockDaily(stock)])
  );
}, 1000);

// Create an HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running\n");
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  let client_authenticated = false;

  setInterval(() => {
    users
      .find({})
      .toArray()
      .then((userDocs) => {
        if (!userDocs) {
          return;
        }

        const updatedUsers = (
          userDocs.map(({ _id, ...rest }) => rest) as Array<User>
        ).map((user) => {
          let net_worth = user.cash;
          Object.keys(user.portfolio).forEach((ticker) => {
            net_worth += user.portfolio[ticker];
          });

          return {
            username: user.username,
            wins: user.wins,
            cash: user.cash,
            portfolio: user.portfolio,
            net_worth: net_worth,
          };
        });

        ws.send(JSON.stringify({ users: updatedUsers }));

        const updatedStocks = Object.fromEntries(
          Object.entries(stocks).map(([key, stock]) => [
            key,
            { name: stock.name, history: stock.history },
          ])
        );

        ws.send(JSON.stringify({ stocks: updatedStocks }));
      });
  }, 1000);

  ws.onmessage = async (message) => {
    console.log(`Received: ${message.data}`);

    if (!client_authenticated) {
      let data: LoginRequest = JSON.parse(message.data);
      console.log("d",data.uuid);

      const userDoc = await users.findOne({ uuid: data.uuid });
      if (!userDoc) {
        const user: User = {
          uuid: new UUID().toString(),
          username: generateUsername("-"),
          wins: 0,
          cash: 10000,
          portfolio: {},
        };
        users.insertOne(user);

        console.log("Welcome, new user! uwu");
        ws.send(JSON.stringify({ uuid: user.uuid }));
        client_authenticated = true;
        return;
      }

      console.log("I'VE PLAYED THESE GAMES BEFORE!");
      ws.send(JSON.stringify({ uuid: data.uuid }));
      client_authenticated = true;
      return;
    }

    let data: Request = message.data;

    const userDoc = await users.findOne({ uuid: data.uuid });

    if (!userDoc) {
      const response: Response = {
        type: ResponseType.Failure,
        message: "INTRUDER ALERT! WHO ARE YOU???",
      };
      ws.send(JSON.stringify(response));
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
      user.portfolio[stockTicker]
        ? (user.portfolio[stockTicker] += stockShares)
        : (user.portfolio[stockTicker] = stockShares);

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

      if (!user.portfolio[stockTicker]) {
        const response: Response = {
          type: ResponseType.Failure,
          message: "You don't own any shares blud.",
        };
        ws.send(JSON.stringify(response));
        return;
      }

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
  };

  ws.onerror = () => {
    console.log("Client crash");
  };

  ws.onclose = () => {
    console.log("Client disconnected");
  };
});

// Start the server
server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
