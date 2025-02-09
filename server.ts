import { createServer } from "http";
import { client } from "./lib/database";
import {
  createStock,
  simulateMarketCrash,
  simulateStockBoom,
  updateStockDaily,
} from "./lib/market";
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
  News,
} from "./types";

const users = client.db("Users").collection("Users");
let stocks: { [key: string]: Stock } = {};
let news: Array<News> = [];

const tickers = [
  "ZNT",
  "VYR",
  "QMTL",
  "BLZ",
  "SNC",
  "ORBX",
  "FLC",
  "TMN",
  "XVR",
  "GRD",
  "NVA",
  "BRQ",
  "EVO",
  "PNT",
  "LMI",
  "CVR",
  "MST",
  "ZRX",
  "TXN",
  "VLT",
  "CBX",
  "AET",
  "NEX",
  "SLR",
  "DRG",
  "OMX",
  "FST",
  "YVA",
  "WVR",
  "BOL",
  "PRX",
  "HMR",
  "AXM",
  "KRY",
  "DYN",
  "ECO",
  "FLX",
  "OBZ",
  "TRK",
  "VZN",
  "QUD",
  "SYV",
  "XTR",
  "TES",
  "LNX",
  "OMB",
  "BRX",
  "CYN",
  "EVR",
  "RAD",
];

const boom_headlines = [
  "Company Reports Record-Breaking Quarterly Earnings",
  "Surge in Consumer Demand Drives Stock Price Higher",
  "Major Partnership Announcement Sparks Investor Optimism",
  "Company Expands into New Market, Shares Soar",
  "Breakthrough Innovation Sends Stock Price Climbing",
  "Unexpected Revenue Growth Exceeds Market Expectations",
  "Stock Spikes Following Positive Analyst Ratings",
  "Company Announces Strategic Acquisition, Shares Rally",
  "New Product Launch Drives Increased Investor Confidence",
  "Strong Industry Trends Fuel Stock Surge",
  "Major Contract Win Boosts Company Valuation",
  "Leadership Shakeup Leads to Renewed Market Optimism",
  "Company Reports Higher-Than-Expected Profit Margins",
  "Positive Economic Data Lifts Company’s Growth Prospects",
  "New Regulatory Approval Opens Doors for Expansion",
  "Strong Institutional Investment Drives Stock Price Up",
  "Investor Sentiment Turns Bullish Amid Market Optimism",
  "Company Announces Stock Buyback Plan, Shares Climb",
  "Earnings Beat Forecasts, Stock Jumps in After-Hours Trading",
  "Major Cost-Cutting Measures Improve Profit Outlook",
  "New Strategic Partnerships Position Company for Growth",
  "Surging Demand for Company’s Services Fuels Stock Rally",
  "Market Momentum Pushes Stock to All-Time High",
  "Expansion Into Emerging Markets Drives Investor Excitement",
  "Company Outperforms Competitors, Gains Market Share",
];

const crash_headlines = [
  "Markets Plummet as Economic Uncertainty Rattles Investors",
  "Stock Market Sees Worst Drop in Years Amid Growing Fears",
  "Panic Selling Sweeps Markets as Investors Flee Risky Assets",
  "Economic Downturn Accelerates, Recession Fears Mount",
  "Financial Sector in Turmoil as Liquidity Crisis Worsens",
  "Central Banks Intervene Amid Widespread Market Collapse",
  "Corporate Bankruptcies Surge as Debt Crisis Deepens",
  "Consumer Spending Declines Sharply, Raising Recession Concerns",
  "Housing Market Crash Sparks Broader Economic Meltdown",
  "Global Supply Chain Disruptions Exacerbate Market Volatility",
  "Mass Layoffs Announced as Businesses Struggle to Stay Afloat",
  "Credit Markets Freeze, Threatening Global Financial Stability",
  "Major Financial Institution Collapses, Sending Shockwaves Through Markets",
  "Inflation Spirals Out of Control, Eroding Consumer Purchasing Power",
  "Government Scrambles to Implement Emergency Economic Measures",
  "Investor Confidence Plummets as Markets Face Extreme Volatility",
  "Unemployment Rates Skyrocket as Companies Cut Costs",
  "Debt Bubble Bursts, Triggering Widespread Financial Contagion",
  "Currency Devaluation Sparks Inflationary Crisis",
  "Interest Rate Hikes Trigger Sharp Decline in Borrowing and Spending",
  "Stock Market in Freefall as Bear Market Takes Hold",
  "Consumer Confidence Hits Record Lows Amid Economic Uncertainty",
  "Major Hedge Fund Collapse Sends Ripple Effects Through Markets",
  "Global Trade Slows as Economic Growth Grinds to a Halt",
  "Government Bailouts Proposed to Prevent Total Economic Collapse",
];

tickers.forEach((name) => {
  const random_type = Math.random() * 7;
  let type;
  if (random_type > 6) {
    type = StockType.Volatile;
  } else if (random_type > 4) {
    type = StockType.Growth;
  } else {
    type = StockType.Stable;
  }

  const stock = createStock(name, {
    basePrice: Math.random() * 500,
    volatility: Math.random() * 0.25,
    drift: Math.random() * 0.01,
    type: type,
  });

  stocks[name] = stock;
});

setInterval(() => {
  stocks = Object.fromEntries(
    Object.entries(stocks).map(([key, stock]) => [key, updateStockDaily(stock)])
  );
}, 1000);

setInterval(() => {
  const random = Math.random();
  if (random > 0.75) {
    const index = Math.floor(Math.random() * Object.values(stocks).length);
    const ticker = Object.keys(stocks)[index];
    stocks[ticker] = simulateStockBoom(stocks[ticker]);
    news.push({
      headline:
        boom_headlines[Math.floor(Math.random() * boom_headlines.length)],
      stocks_affected: ticker,
    });
  } else if (random > 0.7) {
    simulateMarketCrash(Object.values(stocks)).forEach((stock) => {
      stocks[stock.name] = stock;
    });
    news.push({
      headline:
        crash_headlines[Math.floor(Math.random() * crash_headlines.length)],
      stocks_affected: "All",
    });
  }
}, 15000);

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

  setInterval(async () => {
    const usersDocs = await users.find({}).toArray();

    if (!usersDocs) {
      return;
    }

    const updatedUsers = (
      usersDocs.map(({ _id, ...rest }) => rest) as Array<User>
    ).map((user) => {
      let net_worth = user.cash;
      Object.keys(user.portfolio).forEach((ticker) => {
        net_worth +=
          user.portfolio[ticker] *
          stocks[ticker].history[stocks[ticker].history.length - 1].current;
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

    ws.send(JSON.stringify({ news: news.slice(-5) }));
  }, 1000);

  ws.onmessage = async (message) => {
    console.log(`Received: ${message.data}`);

    if (!client_authenticated) {
      let data: LoginRequest = JSON.parse(message.data);
      console.log("d", data.uuid);

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
        ws.send(JSON.stringify({ uuid: user.uuid, username: user.username }));
        client_authenticated = true;
        return;
      }

      const user: User = {
        uuid: userDoc.uuid!,
        username: userDoc.username!,
        wins: userDoc.wins!,
        cash: userDoc.cash!,
        portfolio: userDoc.portfolio!,
      };

      console.log("I'VE PLAYED THESE GAMES BEFORE!");
      ws.send(JSON.stringify({ uuid: data.uuid, username: user.username }));
      client_authenticated = true;
      return;
    }

    let data: Request = JSON.parse(message.data);

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

    if (data.type == RequestType.Buy) {
      const stockTicker = (data as BuyRequest).stock;
      if (!stocks[stockTicker]) {
        const response: Response = {
          type: ResponseType.Failure,
          message: "That stock doesn't exist.",
        };
        ws.send(JSON.stringify(response));
        return;
      }
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

      await users.findOneAndReplace({ uuid: user.uuid }, user);

      const response: Response = {
        type: ResponseType.Success,
        message: "You have purchased the shares.",
      };
      ws.send(JSON.stringify(response));
      return;
    }

    if (data.type == RequestType.Sell) {
      console.log("Selling shares");
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

      await users.findOneAndReplace({ uuid: user.uuid }, user);

      const response: Response = {
        type: ResponseType.Success,
        message: "You have sold the shares.",
      };
      ws.send(JSON.stringify(response));
      return;
    }

    if (data.type == RequestType.Win) {
      if (user.cash < 100000) {
        const response: Response = {
          type: ResponseType.Failure,
          message: "You're way too poor there",
        };
        ws.send(JSON.stringify(response));
        return;
      }

      user.wins++;
      await users.findOneAndReplace({ uuid: user.uuid }, user);

      await users.updateMany({}, { $set: { cash: 10000, portfolio: {} } });

      news.push({
        headline: user.username + " has won!",
        stocks_affected: "Congrats!",
      });

      ws.send(
        JSON.stringify({
          username: user.username,
          wins: user.wins,
        })
      );
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
function simulateStockCrash(): { [key: string]: Stock } {
  throw new Error("Function not implemented.");
}
