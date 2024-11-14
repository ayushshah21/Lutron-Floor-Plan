// src/app/components/Menu.tsx
import { useState, FC } from "react";
import styles from "./Menu.module.css";

interface MenuProps {
  onDelete: () => void;
  onRename: () => void;
  onMove: () => void;
}

// The Menu component is a new file that will be used to handle options for both files and folders.
// It includes options like Rename, Move, and Delete, and can be attached to any item using a button with three dots.
const Menu: FC<MenuProps> = ({ onDelete, onRename, onMove }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false); // Close the menu after an action is selected
  };

  return (
    <div className={styles.menuContainer}>
      <button className={styles.menuButton} onClick={toggleMenu}>
        ⋮ {/* Three dots icon */}
      </button>
      {isOpen && (
        <div className={styles.menuOptions}>
          <button onClick={() => handleMenuClick(onRename)}>Rename</button>
          <button onClick={() => handleMenuClick(onMove)}>Move</button>
          <button onClick={() => handleMenuClick(onDelete)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default Menu;
