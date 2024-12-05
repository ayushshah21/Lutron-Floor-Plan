import { useState } from "react";
import styles from "./Menu.module.css";

type MenuType = "file" | "folder";

interface MenuProps {
  onRename: () => void;
  onDelete: () => void;
  onMove?: () => void;
  type: MenuType; // New prop to specify whether it’s for a file or folder
}

const Menu: React.FC<MenuProps> = ({ onRename, onDelete, onMove, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent clicks from triggering
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setIsOpen(false); // Close the menu after an action
  };

  return (
    <div className={styles.menuContainer}>
      <button className={styles.threeDotButton} onClick={toggleMenu}>
        ⋮ {/* Three dots */}
      </button>
      {isOpen && (
        <div className={styles.popupMenu}>
          <button onClick={() => handleMenuAction(onRename)}>
            Rename {type === "folder" ? "Folder" : "File"}
          </button>
          <button onClick={() => handleMenuAction(onDelete)}>
            Delete {type === "folder" ? "Folder" : "File"}
          </button>
          {onMove && (
            <button onClick={() => handleMenuAction(onMove)}>
              Move {type === "folder" ? "Folder" : "File"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
