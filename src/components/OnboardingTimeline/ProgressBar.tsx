import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="pb-progress-wrapper" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="pb-progress-info">
        <span className="pb-progress-text">{current} / {total} étapes complétées</span>
        <span className="pb-progress-percentage">{percentage}%</span>
      </div>
      <div className="pb-progress-track">
        <div 
          className="pb-progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
