"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [websocket, setWebsocket] = useState(true);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:9001");

    ws.onopen = () => {
      console.log("Websocket opened.");
      setWebsocket(true);
    };

    ws.onerror = () => {
      console.log("Websocket errored.");
      setWebsocket(false);

      ws.close();
    };

    ws.onclose = () => {
      console.log("Websocket closed.");
      setWebsocket(false);

      ws.close();
    };

    ws.onmessage = (event) => {
      console.log("Message recieved.");
      setWebsocket(true);
    };

    return () => {
      console.log("Closing old websocket...");
      setWebsocket(false);

      ws.close();
    };
  }, []);

  return <h1>{"Websocket: " + websocket ? "Opened" : "Closed"}</h1>;
}
