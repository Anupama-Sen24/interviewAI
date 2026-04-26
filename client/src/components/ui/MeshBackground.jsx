import React from 'react';

const MeshBackground = () => {
  return (
    <div 
      className="fixed inset-0 -z-10 bg-background"
      style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%)
        `
      }}
    />
  );
};

export default MeshBackground;
