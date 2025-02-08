import { client } from "../../../lib/database";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const users = client.db("Users").collection("Users");

  const body = JSON.parse(request.body);

  const response = new Response("Hello", { status: 201, statusText: "Yay!" });

  return response;
}
