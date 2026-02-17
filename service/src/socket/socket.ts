import { io, Socket } from "socket.io-client";
import { Logger } from "../utils/logger";
import { chatJoinPayloadType } from "../sdk";

export type SocketListenerType =
  | "limit-reached"
  | "delivered"
  | "on-alice-join"
  | "on-alice-disconnect"
  | "chat-message"
  | "webrtc-session-description";

export type SubscriptionType = Map<SocketListenerType, Set<(...args: unknown[]) => void>>;
export type SubscriptionContextType = () => SubscriptionType;

const SOCKET_LISTENERS: Record<string, SocketListenerType> = {
  LIMIT_REACHED: "limit-reached",
  DELIVERED: "delivered",
  ON_ALICE_JOIN: "on-alice-join",
  ON_ALICE_DISCONNECT: "on-alice-disconnect",
  CHAT_MESSAGE: "chat-message",
  WEBRTC_SESSION_DESCRIPTION: "webrtc-session-description",
};

const getBaseURL = (): string => {
  if (!process.env.CHATE2EE_API_URL) {
    console.warn("CHATE2EE_API_URL is not set");
  }

  return (
    process.env.CHATE2EE_API_URL ||
    "https://chat-e2ee-2.azurewebsites.net"
  );
};

interface ChatMessagePayload {
  channel: string;
  sender: string;
  id: string;
}

export class SocketInstance {
  private socket: Socket;
  private eventHandlerLogger: Logger;

  constructor(
    private subscriptionContext: SubscriptionContextType,
    private logger: Logger
  ) {
    this.socket = io(`${getBaseURL()}`);
    this.eventHandlerLogger = this.logger.createChild("eventHandlerLogger");

    // Register all listeners
    Object.values(SOCKET_LISTENERS).forEach((event) => {
      this.socket.on(event, (...args: unknown[]) => {
        if (event === "chat-message") {
          this.handler(event, args);
          this.markDelivered(args[0] as ChatMessagePayload);
        } else {
          this.handler(event, args);
        }
      });
    });

    this.logger.log("Initialized SocketInstance");
  }

  public joinChat(payload: chatJoinPayloadType): void {
    const { publicKey, ...rest } = payload;
    this.logger.log(
      `joinChat(), publicKey removed from log, ${JSON.stringify(rest)}`
    );

    this.socket.emit("chat-join", payload);
  }

  public dispose(): void {
    this.logger.log("disconnect()");
    this.socket.disconnect();
  }

  private handler(
    listener: SocketListenerType,
    args: unknown[]
  ): void {
    const loggerWithCount = this.eventHandlerLogger.count();
    loggerWithCount.log(`handler called for ${listener}`);

    const callbacks = this.subscriptionContext().get(listener);
    callbacks?.forEach((fn) => fn(...args));
  }

  private markDelivered(msg: ChatMessagePayload): void {
    if (!msg) return;

    this.logger.log("markDelivered()");
    this.socket.emit("received", {
      channel: msg.channel,
      sender: msg.sender,
      id: msg.id,
    });
  }
}
