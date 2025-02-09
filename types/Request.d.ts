import { UUID } from "mongodb";

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
