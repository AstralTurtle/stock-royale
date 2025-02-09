import { createServer } from "http";
import { client } from "./lib/database";
import { createStock } from "./lib/market";
import { Stock, StockType } from "./types/Stock";
import tickers from "./stocks.json";
import { WebSocketServer } from "ws";
import { BuyRequest, Request, RequestType } from "./types/Request";
import { Response, ResponseType } from "./types/Response";
import { UUID } from "mongodb";
import { User } from "./lib/user";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const users = client.db("Users").collection("Users");

const stocks: { [key: string]: Stock } = {};

tickers.forEach((name) => {
  const stock = createStock(name, {
    basePrice: 200,
    volatility: 0.02,
    drift: 0.0005,
    type: StockType.Stable,
  });

  stocks[name] = stock;
});

// Create an HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running\n");
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.onmessage = (message) => {
    console.log(`Received: ${message}`);

    let data: Request = message.data;
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
    });
  };

  ws.onclose = () => {
    console.log("Client disconnected");
  };
});

// Start the server
server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
