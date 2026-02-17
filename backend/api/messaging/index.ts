import express, { Request, Response } from 'express';

import { insertInDb, findOneFromDB } from '../../db';
import { PUBLIC_KEY_COLLECTION } from '../../db/const';
import asyncHandler from '../../middleware/asyncHandler';
import { SOCKET_TOPIC, socketEmit } from '../../socket';
import getClientInstance from '../../socket/clients';
import channelValid from '../chatHash/utils/validateChannel';

import {
  ChatMessageType,
  GetPublicKeyResponse,
  MessageResponse,
  SharePublicKeyResponse,
  UsersInChannelResponse
} from './types';

const router = express.Router({ mergeParams: true });
const clients = getClientInstance();

/* ================================
   SEND MESSAGE
================================ */

router.post(
  "/message",
  asyncHandler(async (req: Request, res: Response): Promise<Response<MessageResponse>> => {
    const { message, sender, channel, image } = req.body;

    if (!message) {
      return res.sendStatus(400);
    }

    const { valid } = await channelValid(channel);

    if (!valid) {
      return res.sendStatus(404);
    }

    if (!clients.isSenderInChannel(channel, sender)) {
      console.error('Sender is not in channel');
      return res.status(401).send({ error: "Permission denied" });
    }

    const receiver = clients.getReceiverIDBySenderID(sender, channel);

    if (!receiver) {
      console.error('No receiver is in the channel');
      return res.status(406).send({ error: "No user available" });
    }

    const id = Date.now();
    const timestamp = Date.now();

    const dataToPublish: ChatMessageType = {
      channel,
      sender,
      message,
      id,
      timestamp
    };

    if (image) {
      return res.status(400).send({ message: "Image not supported" });
    }

    const receiverSid = clients.getSIDByIDs(receiver, channel).sid;

    socketEmit(
      SOCKET_TOPIC.CHAT_MESSAGE,
      receiverSid,
      dataToPublish
    );

    return res.send({ message: "message sent", id, timestamp });
  })
);

/* ================================
   SHARE PUBLIC KEY
================================ */

router.post(
  "/share-public-key",
  asyncHandler(async (req: Request, res: Response): Promise<Response<SharePublicKeyResponse>> => {
    const { aesKey, publicKey, sender, channel } = req.body;

    const { valid } = await channelValid(channel);

    if (!valid) {
      return res.sendStatus(404);
    }

    await insertInDb(
      { aesKey, publicKey, user: sender, channel },
      PUBLIC_KEY_COLLECTION
    );

    return res.send({ status: "ok" });
  })
);

/* ================================
   GET PUBLIC KEY
================================ */

router.get(
  "/get-public-key",
  asyncHandler(async (req: Request, res: Response): Promise<Response<GetPublicKeyResponse>> => {
    const { userId, channel } = req.query;

    const { valid } = await channelValid(channel as string);

    if (!valid) {
      return res.sendStatus(404);
    }

    const receiverID = clients.getReceiverIDBySenderID(
      userId as string,
      channel as string
    );

    const data = await findOneFromDB<GetPublicKeyResponse>(
      { channel, user: receiverID },
      PUBLIC_KEY_COLLECTION
    );

    return res.send(
      data || {
        publicKey: null,
        aesKey: null
      }
    );
  })
);

/* ================================
   GET USERS IN CHANNEL
================================ */

router.get(
  "/get-users-in-channel",
  asyncHandler(async (req: Request, res: Response): Promise<Response<UsersInChannelResponse>> => {
    const { channel } = req.query;

    const { valid } = await channelValid(channel as string);

    if (!valid) {
      return res.sendStatus(404);
    }

    const data = clients.getClientsByChannel(channel as string);

    const usersInChannel = data
      ? Object.keys(data).map((userId) => ({ uuid: userId }))
      : [];

    return res.send(usersInChannel);
  })
);

export default router;
