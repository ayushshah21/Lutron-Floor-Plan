// Reusable and custom modal 
import React from 'react';
import styles from './Modal.module.css'; 

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    children?: React.ReactNode; // For rendering custom content inside the modal
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, onConfirm, children, title }) => {
    if (!isVisible) return null; // Don't render modal if it's not visible

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                {title && <h2>{title}</h2>}
                <div className={styles.modalContent}>
                    {children}
                </div>
                <div className={styles.modalButtons}>
                    <button className={styles.button} onClick={onConfirm}>Confirm</button>
                    <button className={styles.button} onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
