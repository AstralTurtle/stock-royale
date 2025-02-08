import type { NextApiRequest, NextApiResponse } from "next";
import { MongoDB } from "../../../../lib/database";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const slug = req.query;
    const market = MongoDB.db("Market");
    const NYUSE = market.collection("NYUSE");

    return res;
  } else {
  }
}
