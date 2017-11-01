package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.core.util.RandomStringGenerator

object PresentationPodFactory {
  private def genId(): String = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8)

  def create(ownerId: String): PresentationPod = {
    val currentPresenter = ownerId
    PresentationPod(genId(), ownerId, currentPresenter, Map.empty)
  }

  def createDefaultPod(ownerId: String): PresentationPod = {
    val currentPresenter = ownerId

    // we hardcode the podId of the default presentation pod for the purposes of having bbb-web know the podId
    // in advance (so we can fully process default.pdf) // TODO change to a generated podId
    PresentationPod("DEFAULT_PRESENTATION_POD", ownerId, currentPresenter, Map.empty)
  }
}

case class PresentationInPod(id: String, name: String, current: Boolean = false,
                             pages: scala.collection.immutable.Map[String, PageVO], downloadable: Boolean) {

  def makePageCurrent(pres: PresentationInPod, pageId: String): Option[PresentationInPod] = {
    pres.pages.get(pageId) match {
      case Some(newCurPage) =>
        val page = newCurPage.copy(current = true)
        val newPages = pres.pages + (page.id -> page)
        val newPres = pres.copy(pages = newPages)
        Some(newPres)
      case None =>
        None
    }
  }

}

case class PresentationPod(id: String, ownerId: String, currentPresenter: String,
                           presentations: collection.immutable.Map[String, PresentationInPod]) {
  def addPresentation(presentation: PresentationInPod): PresentationPod = {
    println(s" 1 PresentationPods::addPresentation  ${presentation.id}  presName=${presentation.name}   current=${presentation.current} ")
    copy(presentations = presentations + (presentation.id -> presentation))
  }

  def removePresentation(id: String): PresentationPod = copy(presentations = presentations - id)

  def setCurrentPresenter(userId: String): PresentationPod = copy(currentPresenter = userId)

  def getCurrentPresentation(): Option[PresentationInPod] = presentations.values find (p => p.current)

  def getPresentation(presentationId: String): Option[PresentationInPod] =
    presentations.values find (p => p.id == presentationId)

  def setCurrentPresentation(presId: String): Option[PresentationPod] = {
    var tempPod: PresentationPod = this
    presentations.values foreach (curPres => { // unset previous current presentation
      if (curPres.id != presId) {
        val newPres = curPres.copy(current = false)
        tempPod = tempPod.addPresentation(newPres)
      }
    })

    presentations.get(presId) match { // set new current presentation
      case Some(pres) =>
        val cp = pres.copy(current = true)
        tempPod = tempPod.addPresentation(cp)
      case None => None
    }

    Some(tempPod)
  }

  def setCurrentPage(presentationId: String, pageId: String): Option[PresentationPod] = {
    for {
      pres <- presentations.get(presentationId)
      newPres <- pres.makePageCurrent(pres, pageId)
    } yield {
      addPresentation(deactivateCurrentPage(newPres, pageId))
    }
  }

  private def deactivateCurrentPage(pres: PresentationInPod, pageIdToIgnore: String): PresentationInPod = {
    var updatedPres = pres
    pres.pages.values.find(p => p.current && p.id != pageIdToIgnore).foreach { cp =>
      val page = cp.copy(current = false)
      val nPages = pres.pages + (page.id -> page)
      val newPres = pres.copy(pages = nPages)
      updatedPres = newPres
    }
    updatedPres
  }

  def getPresentationsSize(): Int = {
    presentations.values.size
  }

  def printPod(): String = {
    val b = s"printPod (${presentations.values.size}):"
    var d = ""
    presentations.values.foreach(p => d += s"\nPRES_ID=${p.id} NAME=${p.name} CURRENT=${p.current}\n")
    b.concat(s"PODID=$id  OWNERID=$ownerId  CURRENTPRESENTER=$currentPresenter PRESENTATIONS={{{$d}}}\n")
  }
}

case class PresentationPodManager(presentationPods: collection.immutable.Map[String, PresentationPod]) {

  def addPod(presPod: PresentationPod): PresentationPodManager = {
    copy(presentationPods = presentationPods + (presPod.id -> presPod))
  }

  def removePod(podId: String): PresentationPodManager = {
    copy(presentationPods = presentationPods - podId)
  }

  def getNumberOfPods(): Int = presentationPods.size
  def getPod(podId: String): Option[PresentationPod] = presentationPods.get(podId)
  def getAllPresentationPodsInMeeting(): Vector[PresentationPod] = presentationPods.values.toVector
  def updatePresentationPod(presPod: PresentationPod): PresentationPodManager = addPod(presPod)

  def addPresentationToPod(podId: String, pres: PresentationInPod): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
    } yield {
      updatePresentationPod(pod.addPresentation(pres))
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

  def removePresentationInPod(podId: String, presentationId: String): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
    } yield {
      updatePresentationPod(pod.removePresentation(presentationId))
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

  def printPods(): String = {
    var a = s"printPods (${presentationPods.values.size}):"
    presentationPods.values.foreach(pod => a = a.concat(pod.printPod()))
    a
  }

  def setCurrentPresentation(podId: String, presId: String): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
      podWithAdjustedCurrentPresentation <- pod.setCurrentPresentation(presId)

    } yield {
      updatePresentationPod(podWithAdjustedCurrentPresentation)
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

}
