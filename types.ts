import { UUID } from "mongodb";

export interface User {
  uuid: UUID;
  username: string;
  wins: number;
  cash: number;
  portfolio: Record<string, number>;
}

export interface Report {
  players: Array<User>;
  stocks: Array<Stock>;
}

export enum RequestType {
  Buy,
  Sell,
  Win,
}

export interface Request {
  type: RequestType;
  uuid: UUID;
  message?: string;
}

export interface BuyRequest extends Request {
  stock: string;
  shares: number;
}

export interface SellRequest extends Request {
  stock: string;
  shares: number;
}

export interface WinRequest extends Request {}

export enum ResponseType {
  Success,
  Failure,
}

export interface Response {
  type: ResponseType;
  message?: string;
}

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
