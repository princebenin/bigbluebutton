import Auth from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api/index.js';

const getEmojiData = () => {
  // Get userId and meetingId
  const credentials = Auth.credentials;
  const { requesterUserId: userId, meetingId } = credentials;

  // Find the Emoji Status of this specific meeting and userid
  const userEmojiStatus = Users.findOne({
    meetingId,
    userId,
  }).emoji;

  return {
    userEmojiStatus,
    credentials,
  };
};

// Below doesn't even need to receieve credentials
const setEmoji = (toRaiseUserId, status) => {
  makeCall('setEmojiStatus', toRaiseUserId, status);
};

export default {
  getEmojiData,
  setEmoji,
};
