import { useState } from "react";
import { deleteItem, renameItem, moveItem } from "../utils/menuUtils";
import { useDeleteDocument } from "./useDeleteDocument"; // Assumes you have this hook already set up

export const useMenuActions = () => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { deleteDocument } = useDeleteDocument();

    const openMenu = (itemId: string) => {
        setSelectedItemId(itemId);
        setIsMenuOpen(true);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setSelectedItemId(null);
    };

    const handleDelete = async () => {
        if (selectedItemId) {
            await deleteItem(selectedItemId, deleteDocument);
            closeMenu();
        }
    };

    const handleRename = async (newName: string) => {
        if (selectedItemId) {
            await renameItem(selectedItemId, newName);
            closeMenu();
        }
    };

    const handleMove = async (newFolderId: string) => {
        if (selectedItemId) {
            await moveItem(selectedItemId, newFolderId);
            closeMenu();
        }
    };

    return { isMenuOpen, openMenu, closeMenu, handleDelete, handleRename, handleMove };
};
