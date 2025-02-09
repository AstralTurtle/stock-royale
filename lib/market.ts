import { StockPrices, StockConfig, StockType, Stock } from "../types";

export function modifyStockPrice(
  previousClose: number,
  mu: number = 0.0005,
  sigma: number = 0.02,
  k: number = 3
): StockPrices {
  const generateGaussian = (mean: number, stdDev: number): number => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return (
      Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev +
      mean
    );
  };

  const openPrice = previousClose;
  const dailyReturn = generateGaussian(mu, sigma);
  const closePrice = openPrice * (1 + dailyReturn);

  const trueRange = k * sigma * openPrice;
  const movement = Math.abs(closePrice - openPrice);
  const remainingRange = Math.max(trueRange - movement, 0);
  const a = Math.random();

  let high: number, low: number;

  if (closePrice > openPrice) {
    high = closePrice + a * remainingRange;
    low = openPrice - (1 - a) * remainingRange;
  } else {
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

export function initalizeStockPrice(config: StockConfig): number {
  switch (config.type) {
    case StockType.Growth:
      return Math.max(10, config.basePrice * (0.8 + Math.random() * 0.4));
    case StockType.Volatile:
      return config.basePrice * (0.5 + Math.random());
    default:
      return config.basePrice * (0.9 + Math.random() * 0.2);
  }
}

export function createStock(name: string, config: StockConfig): Stock {
  const initialPrice = initalizeStockPrice(config);

  return {
    name,
    previousClose: initialPrice,
    history: [],
    config,
  };
}

export function updateStockDaily(stock: Stock): Stock {
  const newPrices = modifyStockPrice(
    stock.previousClose,
    stock.config.drift,
    stock.config.volatility
  );

  let updatedStock = {
    ...stock,
    previousClose: newPrices.close,
    history: [...stock.history.slice(-7), newPrices],
  };

  updatedStock = applyStockSplits(updatedStock);
  updatedStock = preventPennyStock(updatedStock);

  return updatedStock;
}

function applyStockSplits(stock: Stock): Stock {
  if (stock.previousClose > 50000) {
    return {
      ...stock,
      previousClose: stock.previousClose / 2,
      history: stock.history.map((prices) => ({
        open: prices.open / 2,
        high: prices.high / 2,
        low: prices.low / 2,
        close: prices.close / 2,
        current: prices.current / 2,
      })),
    };
  }
  return stock;
}

function preventPennyStock(stock: Stock): Stock {
  if (stock.previousClose < 1) {
    return {
      ...stock,
      previousClose: 1,
      history: stock.history.map((prices) => ({
        open: Math.max(prices.open, 1),
        high: Math.max(prices.high, 1),
        low: Math.max(prices.low, 1),
        close: Math.max(prices.close, 1),
        current: Math.max(prices.current, 1),
      })),
    };
  }
  return stock;
}

export function simulateStockBoom(
  stock: Stock,
  boomSeverity: number = 0.5,
  boomDuration: number = 10
): Stock {
  // Validate boom severity (e.g., 0.5 = 50% rise)
  boomSeverity = Math.min(Math.max(boomSeverity, 0), 2); // Clamp between 0% and 200%

  // Simulate boom over the specified duration (in days)
  for (let day = 0; day < boomDuration; day++) {
    // Increase volatility during the boom
    const boomVolatility = stock.config.volatility * 1.5; // 1.5x volatility
    const boomDrift = 0.03; // Positive drift (optimistic buying)

    // Generate boom prices
    const newPrices = modifyStockPrice(
      stock.previousClose,
      boomDrift,
      boomVolatility
    );

    // Apply boom severity to the close price
    newPrices.close *= 1 + boomSeverity / boomDuration;
    newPrices.current = newPrices.close; // Assume current = close for simplicity

    // Update stock
    stock = {
      ...stock,
      previousClose: newPrices.close,
      history: [...stock.history.slice(-7), newPrices],
    };
  }

  return stock;
}

export function simulateMarketCrash(
  stocks: Stock[],
  crashSeverity: number = 0.3,
  crashDuration: number = 5
): Stock[] {
  // Validate crash severity (e.g., 0.3 = 30% drop)
  crashSeverity = Math.min(Math.max(crashSeverity, 0), 1); // Clamp between 0% and 100%

  // Simulate crash over the specified duration (in days)
  for (let day = 0; day < crashDuration; day++) {
    stocks = stocks.map((stock) => {
      // Increase volatility during the crash
      const crashVolatility = stock.config.volatility * 2; // Double volatility
      const crashDrift = -0.05; // Negative drift (panic selling)

      // Generate crash prices
      const newPrices = modifyStockPrice(
        stock.previousClose,
        crashDrift,
        crashVolatility
      );

      // Apply crash severity to the close price
      newPrices.close *= 1 - crashSeverity / crashDuration;
      newPrices.current = newPrices.close; // Assume current = close for simplicity

      // Update stock
      return {
        ...stock,
        previousClose: newPrices.close,
        history: [...stock.history.slice(-7), newPrices],
      };
    });
  }

  return stocks;
}
