import React from 'react';
import PropTypes from 'prop-types';

import SoftTypography from 'components/SoftTypography';

function SubmitInput({ label, placeholder, value, onChange }) {
  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box', // Ensures padding is included in the width
  };

  const placeholderStyle = {
    color: '#aaa',
  };

  const submitButtonStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  };

  const handleSubmit = () => {
    // Handle submission logic here
  };
  return (
    <div className="chat-input-container">
        <SoftTypography variant="h6">
        {label && <label>{label}</label>}
        </SoftTypography>
      <input
        type="text"
        style={inputStyle}
        placeholder={placeholder}
        value={value}
        onChange={(e)=> onChange(e.target.value)}
      />
    </div>
  );
}

SubmitInput.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func
  };

export default SubmitInput;