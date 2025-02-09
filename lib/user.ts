import { UUID } from "mongodb";

export interface User {
  uuid: UUID
  username: string;
  wins: number;
  cash: number;
  portfolio: Record<string, number>;
}
