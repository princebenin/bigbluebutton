package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SetCurrentPresentationPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
    msg: SetCurrentPresentationPubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastSetCurrentPresentationEvent(podId: String, userId: String, presentationId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(SetCurrentPresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCurrentPresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = SetCurrentPresentationEvtMsgBody(podId, presentationId)
      val event = SetCurrentPresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val podId = msg.body.podId
    val presId = msg.body.presentationId

    val newState = for {
      updatedPod <- PresentationPodsApp.setCurrentPresentationInPod(state, podId, presId)
    } yield {
      broadcastSetCurrentPresentationEvent(podId, msg.header.userId, presId)

      log.warning("_____ SetCurrentPresentationPubMsgHdlr before_ " + state.presentationPodManager.printPods())
      val pods = state.presentationPodManager.addPod(updatedPod)
      log.warning("_____ SetCurrentPresentationPubMsgHdlr after_ " + pods.printPods())
      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }
}
