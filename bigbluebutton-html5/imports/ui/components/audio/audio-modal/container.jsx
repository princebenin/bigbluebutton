import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import AudioModal from './component';
import Service from '../service';

const AudioModalContainer = props => <AudioModal {...props} />;

export default withModalMounter(createContainer(({ mountModal }) =>
   ({
     closeModal: () => {
       if (!Service.isConnecting()) mountModal(null);
     },
     joinMicrophone: () =>
       new Promise((resolve, reject) => {
         Service.transferCall().then(() => {
           mountModal(null);
           resolve();
         }).catch(() => {
           Service.exitAudio();
           reject();
         });
       }),
     joinListenOnly: () => Service.joinListenOnly().then(() => mountModal(null)),
     leaveEchoTest: () => {
       if (!Service.isEchoTest()) {
         return Promise.resolve();
       }
       return Service.exitAudio();
     },
     changeInputDevice: inputDeviceId => Service.changeInputDevice(inputDeviceId),
     changeOutputDevice: outputDeviceId => Service.changeOutputDevice(outputDeviceId),
     joinEchoTest: () => Service.joinEchoTest(),
     exitAudio: () => Service.exitAudio(),
     isConnecting: Service.isConnecting(),
     isConnected: Service.isConnected(),
     isEchoTest: Service.isEchoTest(),
     inputDeviceId: Service.inputDeviceId(),
     outputDeviceId: Service.outputDeviceId(),
   }), AudioModalContainer));
