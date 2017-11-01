import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import styles from './styles';

const propTypes = {
  handleEndMeeting: PropTypes.func.isRequired,
  intl: PropTypes.shape(intlShape).isRequired,
  router: PropTypes.object.isRequired,
  showEndMeeting: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.leaveConfirmation.title',
    description: 'Leave session modal title',
  },
  message: {
    id: 'app.leaveConfirmation.message',
    description: 'message for leaving session',
  },
  confirmLabel: {
    id: 'app.leaveConfirmation.confirmLabel',
    description: 'Confirmation button label',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
    description: 'adds context to confim option',
  },
  dismissLabel: {
    id: 'app.leaveConfirmation.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.leaveConfirmation.dismissDesc',
    description: 'adds context to dismiss option',
  },
  endMeetingLabel: {
    id: 'app.leaveConfirmation.endMeetingLabel',
    description: 'End meeting button label',
  },
  endMeetingDesc: {
    id: 'app.leaveConfirmation.endMeetingDesc',
    description: 'adds context to end meeting option',
  },
});

const LeaveConfirmation = ({
  intl,
  router,
  handleEndMeeting,
  showEndMeeting,
}) => (
  <Modal
    title={intl.formatMessage(intlMessages.title)}
    confirm={{
      callback: () => router.push('/logout'),
      label: intl.formatMessage(intlMessages.confirmLabel),
      description: intl.formatMessage(intlMessages.confirmDesc),
    }}
    dismiss={{
      callback: () => null,
      label: intl.formatMessage(intlMessages.dismissLabel),
      description: intl.formatMessage(intlMessages.dismissDesc),
    }}
  >
    {intl.formatMessage(intlMessages.message)}
    {showEndMeeting ?
      <Button
        className={styles.endMeeting}
        label={intl.formatMessage(intlMessages.endMeetingLabel)}
        onClick={handleEndMeeting}
        aria-describedby={'modalEndMeetingDesc'}
      /> : null
    }
    <div id="modalEndMeetingDesc" hidden>{intl.formatMessage(intlMessages.endMeetingDesc)}</div>
  </Modal>
);

LeaveConfirmation.propTypes = propTypes;

export default withRouter(injectIntl(LeaveConfirmation));
