import React, { useState } from "react";
import { useMenuActions } from "../hooks/useMenuActions";

interface MenuProps {
    itemId: string;
    onClose: () => void;
}

const Menu: React.FC<MenuProps> = ({ itemId, onClose }) => {
    const { handleDelete, handleRename, handleMove } = useMenuActions();
    const [newName, setNewName] = useState("");
    const [newFolderId, setNewFolderId] = useState("");

    return (
        <div className="menu">
            <button onClick={() => handleDelete()}>Delete</button>
            <input
                type="text"
                placeholder="New name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={() => handleRename(newName)}>Rename</button>
            <input
                type="text"
                placeholder="New folder ID"
                value={newFolderId}
                onChange={(e) => setNewFolderId(e.target.value)}
            />
            <button onClick={() => handleMove(newFolderId)}>Move</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default Menu;
