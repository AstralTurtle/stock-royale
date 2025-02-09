import { UUID } from "mongodb";

export interface Player {
  uuid: UUID;
  username: string;
  cash: number;
  stocks: Array<string>;
}
