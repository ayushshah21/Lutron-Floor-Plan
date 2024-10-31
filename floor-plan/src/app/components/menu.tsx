// src/components/Menu.tsx
import React from 'react';
import { renameItem, deleteItem, moveItem } from '../utils/menuUtils';

interface MenuProps {
    itemId: string;
    onRename: () => void;
    onDelete: () => void;
    onMove: () => void;
}

const Menu: React.FC<MenuProps> = ({ itemId, onRename, onDelete, onMove }) => {
    return (
        <div className="menu">
            <button onClick={() => { onRename(); renameItem(itemId, 'New Name'); }}>
                Rename
            </button>
            <button onClick={() => { onDelete(); deleteItem(itemId); }}>
                Delete
            </button>
            <button onClick={() => { onMove(); moveItem(itemId, 'New Location'); }}>
                Move
            </button>
        </div>
    );
};

export default Menu;
