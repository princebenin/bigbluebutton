import React, { Component } from 'react';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { defineMessages, injectIntl } from 'react-intl';
import ClosedCaptions from '/imports/ui/components/settings/submenus/closed-captions/component';
import Application from '/imports/ui/components/settings/submenus/application/container';
import Participants from '/imports/ui/components/settings/submenus/participants/component';
import _ from 'lodash';
import { withModalMounter } from '../modal/service';

import Icon from '../icon/component';
import styles from './styles';

const intlMessages = defineMessages({
  appTabLabel: {
    id: 'app.settings.applicationTab.label',
    description: 'label for application tab',
  },
  audioTabLabel: {
    id: 'app.settings.audioTab.label',
    description: 'label for audio tab',
  },
  videoTabLabel: {
    id: 'app.settings.videoTab.label',
    description: 'label for video tab',
  },
  closecaptionTabLabel: {
    id: 'app.settings.closedcaptionTab.label',
    description: 'label for closed-captions tab',
  },
  usersTabLabel: {
    id: 'app.settings.usersTab.label',
    description: 'label for participants tab',
  },
  SettingsLabel: {
    id: 'app.settings.main.label',
    description: 'General settings label',
  },
  CancelLabel: {
    id: 'app.settings.main.cancel.label',
    description: 'Discard the changes and close the settings menu',
  },
  CancelLabelDesc: {
    id: 'app.settings.main.cancel.label.description',
    description: 'Settings modal cancel button description',
  },
  SaveLabel: {
    id: 'app.settings.main.save.label',
    description: 'Save the changes and close the settings menu',
  },
  SaveLabelDesc: {
    id: 'app.settings.main.save.label.description',
    description: 'Settings modal save button label',
  },
});

const propTypes = {
};

class Settings extends Component {
  static setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  }
  constructor(props) {
    super(props);

    const video = props.video;
    const application = props.application;
    const cc = props.cc;
    const participants = props.participants;

    this.state = {
      current: {
        video: _.clone(video),
        application: _.clone(application),
        cc: _.clone(cc),
        participants: _.clone(participants),
      },
      saved: {
        video: _.clone(video),
        application: _.clone(application),
        cc: _.clone(cc),
        participants: _.clone(participants),
      },
      selectedTab: 0,
    };

    this.updateSettings = props.updateSettings;
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  componentWillMount() {
    this.props.availableLocales.then((locales) => {
      this.setState({ availableLocales: locales });
    });
  }

  handleUpdateSettings(key, newSettings) {
    const settings = this.state;
    settings.current[key] = newSettings;
    this.setState(settings);
  }

  handleSelectTab(tab) {
    this.setState({
      selectedTab: tab,
    });
  }

  renderModalContent() {
    const {
      isModerator,
      intl,
    } = this.props;

    return (
      <Tabs
        className={styles.tabs}
        onSelect={this.handleSelectTab}
        selectedIndex={this.state.selectedTab}
        role="presentation"
      >
        <TabList className={styles.tabList}>
          <Tab className={styles.tabSelector} aria-labelledby="appTab">
            <Icon iconName="application" className={styles.icon} />
            <span id="appTab">{intl.formatMessage(intlMessages.appTabLabel)}</span>
          </Tab>
          {/* <Tab className={styles.tabSelector} aria-labelledby="videoTab"> */}
          {/* <Icon iconName='video' className={styles.icon}/> */}
          {/* <span id="videoTab">{intl.formatMessage(intlMessages.videoTabLabel)}</span> */}
          {/* </Tab> */}
          <Tab className={styles.tabSelector} aria-labelledby="ccTab">
            <Icon iconName="user" className={styles.icon} />
            <span id="ccTab">{intl.formatMessage(intlMessages.closecaptionTabLabel)}</span>
          </Tab>
          {/*{ isModerator ?*/}
            {/*<Tab className={styles.tabSelector} aria-labelledby="usersTab">*/}
              {/*<Icon iconName="user" className={styles.icon} />*/}
              {/*<span id="usersTab">{intl.formatMessage(intlMessages.usersTabLabel)}</span>*/}
            {/*</Tab>*/}
            {/*: null }*/}
        </TabList>
        <TabPanel className={styles.tabPanel}>
          <Application
            availableLocales={this.state.availableLocales}
            handleUpdateSettings={this.handleUpdateSettings}
            settings={this.state.current.application}
          />
        </TabPanel>
        {/* <TabPanel className={styles.tabPanel}> */}
        {/* <Video */}
        {/* handleUpdateSettings={this.handleUpdateSettings} */}
        {/* settings={this.state.current.video} */}
        {/* /> */}
        {/* </TabPanel> */}
        <TabPanel className={styles.tabPanel}>
          <ClosedCaptions
            settings={this.state.current.cc}
            handleUpdateSettings={this.handleUpdateSettings}
            locales={this.props.locales}
          />
        </TabPanel>
        {/*{ isModerator ?*/}
          {/*<TabPanel className={styles.tabPanel}>*/}
            {/*<Participants*/}
              {/*settings={this.state.current.participants}*/}
              {/*handleUpdateSettings={this.handleUpdateSettings}*/}
            {/*/>*/}
          {/*</TabPanel>*/}
          {/*: null }*/}
      </Tabs>
    );
  }
  render() {
    const intl = this.props.intl;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.SettingsLabel)}
        confirm={{
          callback: (() => {
            this.props.mountModal(null);
            this.updateSettings(this.state.current);
          }),
          label: intl.formatMessage(intlMessages.SaveLabel),
          description: intl.formatMessage(intlMessages.SaveLabelDesc),
        }}
        dismiss={{
          callback: (() => {
            Settings.setHtmlFontSize(this.state.saved.application.fontSize);
          }),
          label: intl.formatMessage(intlMessages.CancelLabel),
          description: intl.formatMessage(intlMessages.CancelLabelDesc),
        }}
      >
        {this.renderModalContent()}
      </Modal>
    );
  }

}

Settings.propTypes = propTypes;
export default withModalMounter(injectIntl(Settings));
