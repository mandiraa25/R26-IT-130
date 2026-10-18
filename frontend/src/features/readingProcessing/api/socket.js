import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function connectSocket() {
  return io(URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token: localStorage.getItem("token") },
  });
}
