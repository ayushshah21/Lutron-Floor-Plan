export interface Folder {
    id: string;
    name: string;
    userId: string; // User who owns the folder
    parentFolderId?: string; // For nested folders -- only if needed
  }