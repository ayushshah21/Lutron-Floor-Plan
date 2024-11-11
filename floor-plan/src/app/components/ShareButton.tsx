// components/ShareButton.tsx
import { useState } from "react";
import Modal from "./Modal";
import { useShareFile } from "../hooks/useShareFile";
import { Share2 } from "lucide-react";
import "./ShareButton.css";

interface ShareButtonProps {
    fileId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ fileId }) => {
    const [showShareModal, setShowShareModal] = useState<boolean>(false);
    const [shareEmail, setShareEmail] = useState<string>("");
    const { addContributor } = useShareFile();

    const validateEmail = (email: string): boolean => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleShareClick = () => {
        setShowShareModal(true);
    };

    const handleConfirmShare = async () => {
        if (shareEmail) {
            if (!validateEmail(shareEmail)) {
                alert("Please enter a valid email address.");
                return;
            }
            await addContributor(fileId, shareEmail);
            alert("Floor plan successfully shared");
            setShowShareModal(false);
            setShareEmail("");
        } else {
            alert("Please enter an email.");
        }
    };

    const handleCancelShare = () => {
        setShowShareModal(false);
        setShareEmail("");
    };

    return (
        <>
            <button className="share-button" onClick={handleShareClick}>
                <Share2 size={18} />
                Share
            </button>
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