import React from 'react';

export default class ScreenshareComponent extends React.Component {
  componentDidMount() {
    this.props.presenterScreenshareHasStarted();
  }

  render() {
    return (
      <video id="screenshareVideo" style={{ height: '100%', width: '100%' }} />
    );
  }
}
