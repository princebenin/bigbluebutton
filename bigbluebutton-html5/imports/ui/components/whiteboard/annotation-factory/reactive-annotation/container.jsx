import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import ReactiveAnnotationService from './service';
import ReactiveAnnotation from './component';

const ReactiveAnnotationContainer = (props) => {
  if (props.annotation) {
    return (
      <ReactiveAnnotation
        annotation={props.annotation}
        slideWidth={props.slideWidth}
        slideHeight={props.slideHeight}
        drawObject={props.drawObject}
      />
    );
  }

  return null;
};

export default createContainer((params) => {
  const { shapeId } = params;
  const annotation = ReactiveAnnotationService.getAnnotationById(shapeId);

  return {
    annotation,
  };
}, ReactiveAnnotationContainer);

ReactiveAnnotationContainer.propTypes = {
  annotation: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])),
  drawObject: PropTypes.func.isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};

ReactiveAnnotationContainer.defaultProps = {
  annotation: undefined,
};
