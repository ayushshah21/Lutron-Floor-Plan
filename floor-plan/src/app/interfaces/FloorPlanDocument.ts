
export interface FloorPlanDocument {
  id: string;
  contributors: string[];
  createdAt: Date;
  creatorEmail: string;
  originalCreator: string;
  pdfURL: string;
  updatedAt: Date;
  name?: string;
  folderID?: string;
  starred: boolean;
}
