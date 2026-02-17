import * as db from '../../../db';
import { LINK_COLLECTION } from '../../../db/const';
import channelValid, { CHANNEL_STATE } from './validateChannel';

jest.mock('../../../db');

describe('channelValid', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the channel is not provided', async () => {
    await expect(channelValid(''))
      .rejects
      .toThrow("channel - required param");
  });

  it('should return NOT_FOUND if the channel does not exist in the db', async () => {
    jest.spyOn(db, 'findOneFromDB').mockResolvedValueOnce(null as any);

    const result = await channelValid('nonexistent_channel');

    expect(db.findOneFromDB)
      .toBeCalledWith({ hash: 'nonexistent_channel' }, LINK_COLLECTION);

    expect(result.valid).toBe(false);
    expect(result.state).toBe(CHANNEL_STATE.NOT_FOUND);
  });

  it('should return ACTIVE if the channel exists and is not expired or deleted', async () => {

    const channel = {
      hash: 'active_channel',
      expired: false,
      deleted: false
    };

    jest.spyOn(db, 'findOneFromDB')
      .mockResolvedValueOnce(channel as any);

    const result = await channelValid(channel.hash);

    expect(db.findOneFromDB)
      .toBeCalledWith({ hash: 'active_channel' }, LINK_COLLECTION);

    expect(result.valid).toBe(true);
    expect(result.state).toBe(CHANNEL_STATE.ACTIVE);
  });

  it('should return DELETED if the channel exists and is deleted', async () => {

    const channel = {
      hash: 'deleted_channel',
      expired: false,
      deleted: true
    };

    jest.spyOn(db, 'findOneFromDB')
      .mockResolvedValueOnce(channel as any);

    const result = await channelValid(channel.hash);

    expect(result.valid).toBe(false);
    expect(result.state).toBe(CHANNEL_STATE.DELETED);
  });

  it('should return EXPIRED if the channel exists and is expired', async () => {

    const channel = {
      hash: 'expired_channel',
      expired: true,
      deleted: false
    };

    jest.spyOn(db, 'findOneFromDB')
      .mockResolvedValueOnce(channel as any);

    const result = await channelValid(channel.hash);

    expect(result.valid).toBe(false);
    expect(result.state).toBe(CHANNEL_STATE.EXPIRED);
  });

});
