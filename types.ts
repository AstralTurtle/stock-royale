export interface User {
  uuid: string;
  username: string;
  wins: number;
  cash: number;
  portfolio: Record<string, number>;
}

export interface News {
  headline: string;
  stocks_affected: string;
}

export interface Report {
  users: Array<User>;
  stocks: { [ticker: string]: Stock };
}

export enum RequestType {
  Buy,
  Sell,
  Win,
  Login,
}

export interface Request {
  type: RequestType;
  uuid: string;
  message?: string;
}

export interface LoginRequest {
  uuid?: string;
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

export interface LoginResponse {
  uuid: string;
}

export interface Response {
  type: ResponseType;
  message?: string;
}

export interface WinReponse {}

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
