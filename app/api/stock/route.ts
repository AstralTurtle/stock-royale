import { MongoDB } from "../../../lib/database";
import tickers from "../../../stocks.json";
import { createStock, Stock, StockType } from "../../../lib/market";

export async function GET() {
  const market = MongoDB.db("Market");
  const NYUSE = market.collection("NYUSE");

  const stocks: Array<Stock> = [];

  tickers.forEach((name) => {
    const stock = createStock(name, {
      basePrice: 200,
      volatility: 0.02,
      drift: 0.0005,
      type: StockType.Stable,
    });

    stocks.push(stock);
  });

  NYUSE.insertMany(stocks);

  const response = new Response("Hello", { status: 201, statusText: "Yay!" });

  return response;
}
