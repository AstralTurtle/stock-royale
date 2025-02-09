//import { IncomingMessage } from "http";
//import { WebSocketServer } from "ws";

export function SOCKET(
  client: WebSocket
  //request: IncomingMessage,
  //server: WebSocketServer
) {
  console.log("A client connected");

  client.onmessage = (message) => {
    console.log("Received message:", message);
  };

  client.onclose = () => {
    console.log("A client disconnected");
  };
}
