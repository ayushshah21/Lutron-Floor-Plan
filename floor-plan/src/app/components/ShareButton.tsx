import { useState } from "react";
import Modal from "./Modal";
import { useShareFile } from '../hooks/useShareFile';


interface ShareButtonProps {
    fileId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ fileId }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const { addContributor } = useShareFile();

    const handleShareClick = () => {
        setShowShareModal(true);
    };

    const handleConfirmShare = async () => {
        if (shareEmail) {
            await addContributor(fileId, shareEmail);
            setShowShareModal(false);
            setShareEmail("");
        } else {
            alert("Please enter a valid email.");
        }
    };

    const handleCancelShare = () => {
        setShowShareModal(false);
        setShareEmail("");
    };

    return (
        <>
            <button onClick={handleShareClick}>Share</button>
            <Modal
                isVisible={showShareModal}
                onClose={handleCancelShare}
                onConfirm={handleConfirmShare}
                title="Share Floor Plan"
            >
                <input
                    type="email"
                    placeholder="Enter email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="input"
                />
            </Modal>
        </>
    );
};

export default ShareButton;
