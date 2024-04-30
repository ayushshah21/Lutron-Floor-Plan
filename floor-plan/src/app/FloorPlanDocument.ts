
// FloorPlanDocument.ts
export interface FloorPlanDocument {
  id: string;
  contributors: string[];
  createdAt: Date;
  creatorEmail: string;
  originalCreator: string;
  pdfURL: string;
  updatedAt: Date;
  name?: string;
  folderId: string;  // '0' for home page by default
  isStarred?: boolean;  // Defaults to false if not set
}


/*
export interface FloorPlanDocument {
    id: string;
    contributors: string[];
    createdAt: Date;
    creatorEmail: string;
    originalCreator: string;
    pdfURL: string;
    updatedAt: Date;
    name?: string;
    folderId: string; //'0' for home page
    isStarred?: boolean; // Also optional, defaults to false if not set
  }
  
*/