import { client } from "../../../lib/database";
import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../lib/user";
import { UUID } from "mongodb";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const username = data.get("username")?.toString();

  if (!username) {
    const response = new NextResponse("Blud had no username :(", {
      status: 401,
    });
    return response;
  }

  const user: User = {
    uuid: new UUID(),
    username: username,
    wins: 0,
    cash: 10000,
    portfolio: {},
  };

  const users = client.db("Users").collection("Users");

  users.insertOne(user);

  const response = new NextResponse(
    "User has been created with UUID of " + user.uuid.toString(),
    { status: 201 }
  );

  return response;
}
