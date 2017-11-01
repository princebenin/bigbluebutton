package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait RegisterUserReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {

    def buildUserRegisteredRespMsg(meetingId: String, userId: String, name: String, role: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UserRegisteredRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(UserRegisteredRespMsg.NAME, meetingId)
      val body = UserRegisteredRespMsgBody(meetingId, userId, name, role)
      val event = UserRegisteredRespMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    val guestPolicy = liveMeeting.guestsWaiting.getGuestPolicy().policy
    val guestStatus = GuestStatus.determineGuestStatus(
      msg.body.guest,
      guestPolicy,
      msg.body.authed
    )

    println("****** GUEST POLICY = " + guestPolicy + " guestStatus = " + guestStatus)

    val regUser = RegisteredUsers.create(msg.body.intUserId, msg.body.extUserId,
      msg.body.name, msg.body.role, msg.body.authToken,
      msg.body.avatarURL, msg.body.guest, msg.body.authed, guestStatus)

    RegisteredUsers.add(liveMeeting.registeredUsers, regUser)

    log.info("Register user success. meetingId=" + liveMeeting.props.meetingProp.intId
      + " userId=" + msg.body.extUserId + " user=" + regUser)

    val event = buildUserRegisteredRespMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.name, regUser.role)
    outGW.send(event)

    def notifyModeratorsOfGuestWaiting(guests: Vector[GuestWaiting], users: Users2x, meetingId: String): Unit = {
      val mods = Users2x.findAll(users).filter(p => p.role == Roles.MODERATOR_ROLE)
      mods foreach { m =>
        val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, m.intId, guests)
        outGW.send(event)
      }
    }

    def addGuestToWaitingForApproval(guest: GuestWaiting, guestsWaitingList: GuestsWaiting): Unit = {
      GuestsWaiting.add(guestsWaitingList, guest)
    }

    guestStatus match {
      case GuestStatus.ALLOW =>
      // do nothing. Let the user go through.
      case GuestStatus.WAIT =>
        val guest = GuestWaiting(regUser.id, regUser.name, regUser.role)
        addGuestToWaitingForApproval(guest, liveMeeting.guestsWaiting)
        notifyModeratorsOfGuestWaiting(Vector(guest), liveMeeting.users2x, liveMeeting.props.meetingProp.intId)
      case GuestStatus.DENY =>
        log.info("**** TODO: Handle DENY Guest Status")
    }

  }
}
