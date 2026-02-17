import express from 'express';

import { findOneFromDB, insertInDb, updateOneFromDb } from '../../db';
import { LINK_COLLECTION } from '../../db/const';
import asyncHandler from '../../middleware/asyncHandler';
import { LinkType } from './utils/link';
import channelValid, { CHANNEL_STATE } from './utils/validateChannel';
import generateHash from './utils/link';

const router = express.Router({ mergeParams: true });

const generateUniqueHash = async (): Promise<LinkType> => {
  const link = generateHash();

  const pinExists = await findOneFromDB<LinkType>(
    { pin: link.pin },
    LINK_COLLECTION
  );

  if (pinExists) {
    return generateUniqueHash();
  }

  return link;
};

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const link = await generateUniqueHash();
    await insertInDb(link, LINK_COLLECTION);
    return res.send(link);
  })
);

router.get(
  "/:pin",
  asyncHandler(async (req, res) => {
    const { pin } = req.params;

    if (!pin) {
      return res.status(404).send("Invalid pin");
    }

    const link = await findOneFromDB<LinkType>(
      { pin: pin.toUpperCase() },
      LINK_COLLECTION
    );

    const currentTime = Date.now();
    const invalidLink =
      !link || currentTime - link.pinCreatedAt > 30 * 60 * 1000;

    if (invalidLink) {
      return res.status(404).send("Invalid pin");
    }

    return res.send(link);
  })
);

router.get(
  "/status/:channel",
  asyncHandler(async (req, res) => {
    const { channel } = req.params;

    const { valid } = await channelValid(channel);

    if (!valid) {
      return res.status(404).send("Invalid channel");
    }

    return res.send({ status: "ok" });
  })
);

router.delete(
  "/:channel",
  asyncHandler(async (req, res) => {
    const { channel } = req.params;

    const { state } = await channelValid(channel);

    const invalidStates = [
      CHANNEL_STATE.DELETED,
      CHANNEL_STATE.NOT_FOUND
    ];

    if (invalidStates.includes(state)) {
      return res.status(404).send("Invalid channel");
    }

    await updateOneFromDb(
      { hash: channel },
      { deleted: true },
      LINK_COLLECTION
    );

    return res.send({ status: "ok" });
  })
);

export default router;
