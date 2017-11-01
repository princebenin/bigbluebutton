package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.core.running.OutMsgRouter

object Sender {

  def sendUserEjectedFromMeetingClientEvtMsg(meetingId: String, userId: String,
                                             ejectedBy: String, reason: String, outGW: OutMsgRouter): Unit = {
    val ejectFromMeetingClientEvent = MsgBuilder.buildUserEjectedFromMeetingEvtMsg(
      meetingId, userId, ejectedBy, reason
    )
    outGW.send(ejectFromMeetingClientEvent)
  }

  def sendUserEjectedFromMeetingSystemMsg(meetingId: String, userId: String,
                                          ejectedBy: String, outGW: OutMsgRouter): Unit = {
    val ejectFromMeetingSystemEvent = MsgBuilder.buildDisconnectClientSysMsg(
      meetingId, userId, ejectedBy
    )
    outGW.send(ejectFromMeetingSystemEvent)
  }
}
