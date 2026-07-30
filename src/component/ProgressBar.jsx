import React from 'react';
import '../style/ProgressBar.scss';

function ProgressBar({ step, totalSteps }) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">
        Étape {step} sur {totalSteps}
      </div>
    </div>
  );
}

export default ProgressBar;
