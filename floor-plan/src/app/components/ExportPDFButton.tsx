// components/ExportPDFButton.tsx
import { useState } from "react";
import Modal from "./Modal";
import { FileText } from "lucide-react";
import "./ExportPDFButton.css";

interface ExportPDFButtonProps {
    exportCanvasAsPDF: (fileName: string) => void;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ exportCanvasAsPDF }) => {
    const [showExportModal, setShowExportModal] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>("annotated-floorplan");

    const handleExportClick = () => {
        setShowExportModal(true);
    };

    const handleConfirmExport = () => {
        exportCanvasAsPDF(fileName);
        setShowExportModal(false);
    };

    const handleCancelExport = () => {
        setShowExportModal(false);
        setFileName("annotated-floorplan");
    };

    return (
        <>
            <button className="export-button" onClick={handleExportClick}>
                <FileText size={18} />
                Export PDF
            </button>
            <Modal
                isVisible={showExportModal}
                onClose={handleCancelExport}
                onConfirm={handleConfirmExport}
                title="Export Floor Plan as PDF"
            >
                <input
                    type="text"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="input"
                />
            </Modal>
        </>
    );
};

export default ExportPDFButton;
