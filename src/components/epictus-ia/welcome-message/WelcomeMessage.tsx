import React from 'react';
import SolarSystemEpictusTurbo from './SolarSystemEpictusTurbo';

const WelcomeMessage: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <SolarSystemEpictusTurbo />
    </div>
  );
};

export default WelcomeMessage;