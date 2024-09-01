import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSearchPlus, faSearchMinus, faSquare, faLightbulb, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

interface ToolbarProps {
	exportCanvasAsPDF: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	addRectangleToCanvas: () => void;
	addLightIcon: () => void;
	deleteSelectedObject: () => void;
}

const EditorToolbar: React.FC<ToolbarProps> = ({
	exportCanvasAsPDF,
	zoomIn,
	zoomOut,
	addRectangleToCanvas,
	addLightIcon,
	deleteSelectedObject,
}) => {
	return (
		<nav className="sideToolBar">
			<ul>
				<li><button onClick={exportCanvasAsPDF}><FontAwesomeIcon icon={faFilePdf} /> Export as PDF</button></li>
				<li><button onClick={zoomIn}><FontAwesomeIcon icon={faSearchPlus} /> Zoom In</button></li>
				<li><button onClick={zoomOut}><FontAwesomeIcon icon={faSearchMinus} /> Zoom Out</button></li>
				<li><button onClick={addRectangleToCanvas}><FontAwesomeIcon icon={faSquare} /> Add Rectangle</button></li>
				<li><button onClick={addLightIcon}><FontAwesomeIcon icon={faLightbulb} /> Add Light Icon</button></li>
				<li><button onClick={deleteSelectedObject}><FontAwesomeIcon icon={faTrashAlt} /> Delete Selected Object</button></li>
			</ul>
		</nav>
	);
};

export default EditorToolbar;
