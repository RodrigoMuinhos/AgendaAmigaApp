import { io, type Socket } from "socket.io-client";
import { env } from "../core/config/env";

const httpBase = env.apiHttpBase.length > 0 ? env.apiHttpBase : undefined;
const wsPath = env.apiWsPath;

const isSecure = (() => {
  if (httpBase) {
    return httpBase.startsWith("https");
  }
  if (typeof window !== "undefined") {
    return window.location.protocol === "https:";
  }
  return false;
})();

export const socket: Socket = io(httpBase, {
  path: wsPath,
  transports: ["websocket"],
  secure: isSecure,
  withCredentials: false,
});
