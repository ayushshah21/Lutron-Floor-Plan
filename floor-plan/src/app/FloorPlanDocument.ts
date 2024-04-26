
export interface FloorPlanDocument {
    id: string;
    contributors: string[];
    createdAt: Date;
    creatorEmail: string;
    originalCreator: string;
    pdfURL: string;
    updatedAt: Date;
    name?: string;
    folderId?: string; // Optional, if a file is not in a folder, this can be undefined
    isStarred?: boolean; // Also optional, defaults to false if not set
  }
  