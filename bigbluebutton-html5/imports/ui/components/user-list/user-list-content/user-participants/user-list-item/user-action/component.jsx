import React from 'react';
import PropTypes from 'prop-types';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

const UserActions = (props) => {
  const { key, icon, label, handler, options } = props;

  const userAction = (
    <DropdownListItem
      key={key}
      icon={icon}
      label={label}
      defaultMessage={label}
      onClick={() => handler.call(this, ...options)}
    />
  );

  return userAction;
};

UserActions.propTypes = propTypes;
export default UserActions;
