package org.bigbluebutton.modules.present.model {
    import mx.collections.ArrayCollection;
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import com.asfusion.mate.events.Dispatcher;
    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.modules.present.services.PresentationService;
    import org.bigbluebutton.modules.present.services.messages.PresentationPodVO;
    import org.bigbluebutton.modules.present.model.PresentationModel;
    import org.bigbluebutton.modules.present.events.RequestNewPresentationPodEvent;
    import org.bigbluebutton.modules.present.events.NewPresentationPodCreated;
    import org.bigbluebutton.modules.present.events.PresentationPodRemoved;
    import org.bigbluebutton.modules.present.events.RequestPresentationInfoPodEvent;
    import org.bigbluebutton.main.api.JSLog;

    
    public class PresentationPodManager {
        private static const LOGGER:ILogger = getClassLogger(PresentationPodManager);
    
        private static var instance:PresentationPodManager = null;
    
        private var _presentationPods: ArrayCollection = new ArrayCollection();
        private var globalDispatcher:Dispatcher;
        private var presentationService: PresentationService;


        /**
         * This class is a singleton. Please initialize it using the getInstance() method.
         *
         */
        public function PresentationPodManager(enforcer:SingletonEnforcer) {
            if (enforcer == null) {
                throw new Error("There can only be 1 PresentationPodManager instance");
            }
            globalDispatcher = new Dispatcher();

            initialize();
        }
    
        private function initialize():void {
        }
    
        /**
         * Return the single instance of the PresentationPodManager class
         */
        public static function getInstance():PresentationPodManager {
            if (instance == null) {
                instance = new PresentationPodManager(new SingletonEnforcer());
            }

            return instance;
        }
        
        public function setPresentationService(service: PresentationService): void {
            this.presentationService = service;
        }
        
        public function requestDefaultPresentationPod(): void {
            var event:RequestNewPresentationPodEvent = new RequestNewPresentationPodEvent(RequestNewPresentationPodEvent.REQUEST_NEW_PRES_POD);
            event.requesterId = UsersUtil.getMyUserID();
            globalDispatcher.dispatchEvent(event);
        }
        
        public function getPod(podId: String): PresentationModel {
            var resultingPod: PresentationModel = null;
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

                if (pod.getPodId() == podId) {
                    return pod;
                }
            }
            return resultingPod;
        }

        public function handleAddPresentationPod(podId: String, ownerId: String): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;
                if (pod.getPodId() == podId) {
                    return;
                }
            }

            var newPod: PresentationModel = new PresentationModel(podId, ownerId);
            _presentationPods.addItem(newPod);
        }
        
        public function handlePresentationPodRemoved(podId: String, ownerId: String): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

                if (pod.getPodId() == podId) {
                    _presentationPods.removeItemAt(i);
                    return;
                }
            }
        }
        
        public function requestAllPodsPresentationInfo(): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

                var event:RequestPresentationInfoPodEvent = new RequestPresentationInfoPodEvent(RequestPresentationInfoPodEvent.REQUEST_PRES_INFO);
                event.podId = pod.getPodId();
                globalDispatcher.dispatchEvent(event);
            }
        }
        
        public function removeAllPresentationPods(): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var oldPod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;
                // globalDispatcher.dispatchEvent(new PresentationPodRemoved(oldPod.getPodId(), oldPod.getOwnerId()));
                
            }
        }


        public function handleGetAllPodsResp(podsAC: ArrayCollection): void {
//            removeAllPresentationPods();

            for (var j:int = 0; j < podsAC.length; j++) {
                JSLog.warn("__ PresentationPodManager::handleGetAllPodsResp A: " , podsAC.length);
                var podVO: PresentationPodVO = podsAC.getItemAt(j) as PresentationPodVO;
                var newPod: PresentationModel = new PresentationModel(podVO.id, podVO.ownerId);

                globalDispatcher.dispatchEvent(new NewPresentationPodCreated(newPod.getPodId(), newPod.getOwnerId()));

                var presentationsToAdd:ArrayCollection = podVO.getPresentations();
                presentationService.addPresentations(podVO.id, presentationsToAdd);
            }

            if (podsAC.length == 0) { // If there are no pods, request the creation of a default one
                requestDefaultPresentationPod();
            }
        }

        public function updateOwnershipOfDefaultPod(ownerId: String): void {
            var pod: PresentationModel = getPod("DEFAULT_PRESENTATION_POD");
            pod.setOwnerId(ownerId);
        }

    }
}

class SingletonEnforcer{}
