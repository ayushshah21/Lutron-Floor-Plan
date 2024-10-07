import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilePdf, faSearchPlus, faSearchMinus, faSquare, faLightbulb, faPlug, 
  faMobile, faWifi, faTrashAlt, faPencilAlt, faEraser, faVideo, faBorderAll, faDoorOpen, faArrowRight 
} from '@fortawesome/free-solid-svg-icons';

interface ToolbarProps {
  exportCanvasAsPDF: () => void;
  saveFloorPlanChanges: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
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
}

const EditorToolbar: React.FC<ToolbarProps> = ({
  exportCanvasAsPDF,
  saveFloorPlanChanges,
  zoomIn,
  zoomOut,
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
}) => {
  return (
    <nav className="sideToolBar" aria-label="Editor tools">
      <ul>
        <li><button onClick={exportCanvasAsPDF} aria-label="Export as PDF"><FontAwesomeIcon icon={faFilePdf} aria-hidden="true" /> Export as PDF</button></li>
        <li><button onClick={saveFloorPlanChanges} aria-label="Save Changes"><FontAwesomeIcon icon={faFilePdf} aria-hidden="true" /> Save Changes</button></li>
        <li><button onClick={zoomIn} aria-label="Zoom In"><FontAwesomeIcon icon={faSearchPlus} aria-hidden="true" /> Zoom In</button></li>
        <li><button onClick={zoomOut} aria-label="Zoom Out"><FontAwesomeIcon icon={faSearchMinus} aria-hidden="true" /> Zoom Out</button></li>
        <li><button onClick={addRectangleToCanvas} aria-label="Add Rectangle"><FontAwesomeIcon icon={faSquare} aria-hidden="true" /> Add Rectangle</button></li>
        <li><button onClick={addLightIcon} aria-label="Add Light Icon"><FontAwesomeIcon icon={faLightbulb} aria-hidden="true" /> Add Light Icon</button></li>
        <li><button onClick={addFixtureIcon} aria-label="Add Fixture Icon"><FontAwesomeIcon icon={faPlug} aria-hidden="true" /> Add Fixture Icon</button></li>
        <li><button onClick={addDeviceIcon} aria-label="Add Device Icon"><FontAwesomeIcon icon={faMobile} aria-hidden="true" /> Add Device Icon</button></li>
        <li><button onClick={addSensorIcon} aria-label="Add Sensor Icon"><FontAwesomeIcon icon={faWifi} aria-hidden="true" /> Add Sensor Icon</button></li>
        <li><button onClick={deleteSelectedObject} aria-label="Delete Selected Object"><FontAwesomeIcon icon={faTrashAlt} aria-hidden="true" /> Delete Selected Object</button></li>
        <li>
          <button 
            onClick={isDrawing ? disableFreeDrawing : enableFreeDrawing}
            aria-label={isDrawing ? "Disable Drawing" : "Enable Drawing"}
            aria-pressed={isDrawing}
          >
            <FontAwesomeIcon icon={faPencilAlt} aria-hidden="true" /> {isDrawing ? 'Disable Drawing' : 'Enable Drawing'}
          </button>
        </li>
        <li>
          <button 
            onClick={isErasing ? disableEraser : enableEraser}
            aria-label={isErasing ? "Disable Eraser" : "Enable Eraser"}
            aria-pressed={isErasing}
          >
            <FontAwesomeIcon icon={faEraser} aria-hidden="true" /> {isErasing ? 'Disable Eraser' : 'Enable Eraser'}
          </button>
        </li>
        <li><button onClick={addSecurityCameraIcon} aria-label="Add Security Camera Icon"><FontAwesomeIcon icon={faVideo} aria-hidden="true" /> Add Security Camera</button></li>
        <li><button onClick={addWallIcon} aria-label="Add Wall Icon"><FontAwesomeIcon icon={faBorderAll} aria-hidden="true" /> Add Wall</button></li>
        <li><button onClick={addDoorIcon} aria-label="Add Door Icon"><FontAwesomeIcon icon={faDoorOpen} aria-hidden="true" /> Add Door</button></li>
        <li><button onClick={addRightArrowIcon} aria-label="Add Right Arrow Icon"><FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /> Add Right Arrow</button></li>
      </ul>
    </nav>
  );
};

export default EditorToolbar;