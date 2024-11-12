// components/DeleteConfirmation.tsx
import React from 'react';

const DeleteConfirmation = ({ onConfirm }: { onConfirm: () => Promise<void> }) => {
  const confirmDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await onConfirm();
    }
  };

  return <button onClick={confirmDelete}>Delete</button>;
};

export default DeleteConfirmation;
