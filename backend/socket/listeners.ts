import getClientInstance from "./clients";
import channelValid from "../api/chatHash/utils/validateChannel";
import { socketEmit, SOCKET_TOPIC, CustomSocket } from "./";
import { Server } from "socket.io";

const clients = getClientInstance();

const connectionListener = (socket: CustomSocket, io: Server) => {

  socket.on("chat-join", async (data) => {
    const { userID, channelID, publicKey } = data;

    const { valid } = await channelValid(channelID);
    if (!valid) {
      console.error("Invalid channelID - ", channelID);
      return;
    }

    const usersInChannel = clients.getClientsByChannel(channelID) || {};
    const userCount = Object.keys(usersInChannel).length;

    if (userCount === 2) {
      socketEmit(SOCKET_TOPIC.LIMIT_REACHED, socket.id, null);
      socket.disconnect();
      return;
    }

    clients.setClientToChannel(userID, channelID, socket.id);
    socket.channelID = channelID;
    socket.userID = userID;

    const receiverId = Object.keys(usersInChannel).find(u => u !== userID);
    const receiver = receiverId && clients.getSIDByIDs(receiverId, channelID);

    if (receiver) {
      socketEmit(SOCKET_TOPIC.ON_ALICE_JOIN, receiver.sid, { publicKey });
    }
  });

  socket.on("received", ({ channel, sender, id }) => {
    const client = clients.getSIDByIDs(sender, channel);
    if (!client) return;

    socketEmit(SOCKET_TOPIC.DELIVERED, client.sid, id);
  });

  socket.on("disconnect", () => {
    const { channelID, userID } = socket;
    if (!channelID || !userID) return;

    try {
      const receiverID = clients.getReceiverIDBySenderID(userID, channelID);
      const receiver = receiverID && clients.getSIDByIDs(receiverID, channelID);

      clients.deleteClient(userID, channelID);

      if (receiver) {
        socketEmit(SOCKET_TOPIC.ON_ALICE_DISCONNECTED, receiver.sid, null);
      }

    } catch (err) {
      console.log(err);
    }
  });

  socket.emit(SOCKET_TOPIC.MESSAGE, "ping!");
};

export default connectionListener;
