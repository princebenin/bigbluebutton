import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function muteToggle(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteUserCmdMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const payload = {
    userId,
    mutedBy: requesterUserId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
