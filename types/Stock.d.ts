export enum StockType {
  Growth,
  Stable,
  Volatile,
}

export interface StockPrices {
  open: number;
  high: number;
  low: number;
  current: number;
  close: number;
}

export interface Stock {
  name: string;
  previousClose: number;
  history: StockPrices[];
  config: StockConfig;
}

export interface StockConfig {
  basePrice: number;
  volatility: number;
  drift: number;
  type: StockType;
}
