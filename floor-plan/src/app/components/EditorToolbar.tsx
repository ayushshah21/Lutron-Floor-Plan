import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSquare, faLightbulb, faPlug, faMobile, faWifi, faTrashAlt, faPencilAlt, faEraser, 
  faVideo, faBorderAll, faDoorOpen, faArrowRight, faFont, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';

interface ToolbarProps {
  addRectangleToCanvas: () => void;
  addLightIcon: () => void;
  addFixtureIcon: () => void;
  addDeviceIcon: () => void;
  addSensorIcon: () => void;
  deleteSelectedObject: () => void;
  enableFreeDrawing: () => void;
  disableFreeDrawing: () => void;
  enableEraser: () => void;
  disableEraser: () => void;
  isDrawing: boolean;
  isErasing: boolean;
  addSecurityCameraIcon: () => void;
  addWallIcon: () => void;
  addDoorIcon: () => void;
  addRightArrowIcon: () => void;
  addTextbox: () => void;
}

const EditorToolbar: React.FC<ToolbarProps> = ({
  addRectangleToCanvas,
  addLightIcon,
  addFixtureIcon,
  addDeviceIcon,
  addSensorIcon,
  deleteSelectedObject,
  enableFreeDrawing,
  disableFreeDrawing,
  enableEraser,
  disableEraser,
  isDrawing,
  isErasing,
  addSecurityCameraIcon,
  addWallIcon,
  addDoorIcon,
  addRightArrowIcon,
  addTextbox,
}) => {
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (submenu: string) => {
    setOpenSubmenus(prevOpenSubmenus => {
      const newOpenSubmenus = new Set(prevOpenSubmenus);
      if (newOpenSubmenus.has(submenu)) {
        newOpenSubmenus.delete(submenu);
      } else {
        newOpenSubmenus.add(submenu);
      }
      return newOpenSubmenus;
    });
  };

  const renderSubmenu = (title: string, items: JSX.Element[]) => (
    <li className="submenu">
      <button onClick={() => toggleSubmenu(title)} className="submenu-toggle">
        {title}
        <FontAwesomeIcon icon={openSubmenus.has(title) ? faChevronUp : faChevronDown} className="submenu-icon" />
      </button>
      {openSubmenus.has(title) && (
        <ul className="submenu-items">
          {items}
        </ul>
      )}
    </li>
  );

  return (
    <nav className="editor-toolbar" aria-label="Editor tools">
      <ul className="toolbar-menu">
        {renderSubmenu("Shapes", [
          <li key="rectangle"><button onClick={addRectangleToCanvas}><FontAwesomeIcon icon={faSquare} /> Rectangle</button></li>,
        ])}
        
        {renderSubmenu("Icons", [
          <li key="light"><button onClick={addLightIcon}><FontAwesomeIcon icon={faLightbulb} /> Light</button></li>,
          <li key="fixture"><button onClick={addFixtureIcon}><FontAwesomeIcon icon={faPlug} /> Fixture</button></li>,
          <li key="device"><button onClick={addDeviceIcon}><FontAwesomeIcon icon={faMobile} /> Device</button></li>,
          <li key="sensor"><button onClick={addSensorIcon}><FontAwesomeIcon icon={faWifi} /> Sensor</button></li>,
          <li key="camera"><button onClick={addSecurityCameraIcon}><FontAwesomeIcon icon={faVideo} /> Security Camera</button></li>,
        ])}
        
        {renderSubmenu("Architectural", [
          <li key="wall"><button onClick={addWallIcon}><FontAwesomeIcon icon={faBorderAll} /> Wall</button></li>,
          <li key="door"><button onClick={addDoorIcon}><FontAwesomeIcon icon={faDoorOpen} /> Door</button></li>,
          <li key="arrow"><button onClick={addRightArrowIcon}><FontAwesomeIcon icon={faArrowRight} /> Arrow</button></li>,
        ])}
        
        {renderSubmenu("Annotations", [
          <li key="draw">
            <button 
              onClick={isDrawing ? disableFreeDrawing : enableFreeDrawing}
              className={isDrawing ? 'active' : ''}
            >
              <FontAwesomeIcon icon={faPencilAlt} /> {isDrawing ? 'Stop Drawing' : 'Draw'}
            </button>
          </li>,
          <li key="erase">
            <button 
              onClick={isErasing ? disableEraser : enableEraser}
              className={isErasing ? 'active' : ''}
            >
              <FontAwesomeIcon icon={faEraser} /> {isErasing ? 'Stop Erasing' : 'Erase'}
            </button>
          </li>,
          <li key="text"><button onClick={addTextbox}><FontAwesomeIcon icon={faFont} /> Add Text</button></li>,
        ])}
        
        <li>
          <button onClick={deleteSelectedObject} className="delete-button">
            <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default EditorToolbar;
