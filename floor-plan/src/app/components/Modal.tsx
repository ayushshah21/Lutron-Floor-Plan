// Reusable and custom modal 
import React from 'react';
import styles from './Modal.module.css'; 
import ReactDOM from "react-dom";

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    children?: React.ReactNode; // For rendering custom content inside the modal
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, onConfirm, children, title }) => {
    if (!isVisible) return null; // Don't render modal if it's not visible

    return ReactDOM.createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>{title}</h2>
                <div className={styles.modalContent}>{children}</div>
                <div className={styles.modalButtons}>
                    <button onClick={onConfirm} className={styles.modalButton}>Confirm</button>
                    <button onClick={onClose} className={styles.modalButton}>Cancel</button>
                </div>
            </div>
        </div>,
        document.body // This renders the modal directly in the body
    );
};


export default Modal;
