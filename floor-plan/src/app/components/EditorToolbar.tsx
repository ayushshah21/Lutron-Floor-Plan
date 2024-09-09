import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSearchPlus, faSearchMinus, faSquare, faLightbulb, faTrashAlt, faPencilAlt, faEraser } from '@fortawesome/free-solid-svg-icons';

interface ToolbarProps {
	exportCanvasAsPDF: () => void;
	saveFloorPlanChanges: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	addRectangleToCanvas: () => void;
	addLightIcon: () => void;
	deleteSelectedObject: () => void;
	enableFreeDrawing: () => void;
	disableFreeDrawing: () => void;
	enableEraser: () => void;
	disableEraser: () => void;
	isDrawing: boolean;
	isErasing: boolean;
}

const EditorToolbar: React.FC<ToolbarProps> = ({
	exportCanvasAsPDF,
	saveFloorPlanChanges,
	zoomIn,
	zoomOut,
	addRectangleToCanvas,
	addLightIcon,
	deleteSelectedObject,
	enableFreeDrawing,
	disableFreeDrawing,
	enableEraser,
	disableEraser,
	isDrawing,
	isErasing,
}) => {
	return (
		<nav className="sideToolBar">
			<ul>
				<li><button onClick={exportCanvasAsPDF}><FontAwesomeIcon icon={faFilePdf} /> Export as PDF</button></li>
				<li><button onClick={saveFloorPlanChanges}><FontAwesomeIcon icon={faFilePdf} /> Save Changes </button></li>
				<li><button onClick={zoomIn}><FontAwesomeIcon icon={faSearchPlus} /> Zoom In</button></li>
				<li><button onClick={zoomOut}><FontAwesomeIcon icon={faSearchMinus} /> Zoom Out</button></li>
				<li><button onClick={addRectangleToCanvas}><FontAwesomeIcon icon={faSquare} /> Add Rectangle</button></li>
				<li><button onClick={addLightIcon}><FontAwesomeIcon icon={faLightbulb} /> Add Light Icon</button></li>
				<li><button onClick={deleteSelectedObject}><FontAwesomeIcon icon={faTrashAlt} /> Delete Selected Object</button></li>
				<li>
					<button onClick={isDrawing ? disableFreeDrawing : enableFreeDrawing}>
						<FontAwesomeIcon icon={faPencilAlt} /> {isDrawing ? 'Disable Drawing' : 'Enable Drawing'}
					</button>
				</li>
				<li>
					<button onClick={isErasing ? disableEraser : enableEraser}>
						<FontAwesomeIcon icon={faEraser} /> {isErasing ? 'Disable Eraser' : 'Enable Eraser'}
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default EditorToolbar;
