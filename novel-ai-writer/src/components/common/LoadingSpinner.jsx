import React from 'react';

export const LoadingSpinner = ({ size = 'medium', message = '加载中...' }) => {
  const sizes = { small: '20px', medium: '40px', large: '60px' };
  return (
    <div className="loading-container">
      <div className="loading-spinner" style={{ width: sizes[size], height: sizes[size] }} />
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
};