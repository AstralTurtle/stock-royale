import { Stock } from "./Stock";
import { Player } from "./Player";

export interface Report {
  players: Array<Player>;
  stocks: Array<Stock>;
}
