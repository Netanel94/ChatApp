// socket.ts - Create this file
import { io } from "socket.io-client";

// Create socket instance OUTSIDE of React component
export const socket = io("http://localhost:8000", {
  autoConnect: false, // Don't connect immediately
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

export default socket;
