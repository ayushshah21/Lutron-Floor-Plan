// components/ThreeDotMenu.tsx
import React from 'react';

const ThreeDotMenu = ({ onOpen, onClose, show }: { onOpen: () => void, onClose: () => void, show: boolean }) => (
  <div onMouseLeave={onClose}>
    {show ? (
      <div className="menu">
        {/* Add your menu items here */}
      </div>
    ) : (
      <button onClick={onOpen}>...</button>
    )}
  </div>
);

export default ThreeDotMenu;
