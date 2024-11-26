import React, { useState } from 'react';
import Modal from './Modal';
import styles from './AddFolderButton.module.css'; 

interface AddFolderButtonProps {
    onCreateFolder: (folderName: string) => void; // Pass the function to create a folder
}

const AddFolderButton: React.FC<AddFolderButtonProps> = ({ onCreateFolder }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [folderName, setFolderName] = useState('');

    const handleConfirm = () => {
        if (folderName.trim()) {
            onCreateFolder(folderName);
            setFolderName('');
            setModalVisible(false);
        } else {
            alert('Please enter a valid folder name.');
        }
    };

    const handleCancel = () => {
        setFolderName('');
        setModalVisible(false);
    };

    return (
        <div>
            <button
                className={styles.addFolderButton}
                onClick={() => setModalVisible(true)}
            >
                + Add Folder
            </button>
            <Modal
                isVisible={isModalVisible}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title="Add New Folder"
            >
                <input
                    type="text"
                    placeholder="Enter folder name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className={styles.input}
                />
            </Modal>
        </div>
    );
};

export default AddFolderButton;
