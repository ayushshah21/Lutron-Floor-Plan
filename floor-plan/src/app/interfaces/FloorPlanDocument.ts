export interface FloorPlanDocument {
    id: string;
    contributors: string[];
    createdAt: Date;
    creatorEmail: string;
    originalCreator: string;
    pdfURL: string;
    updatedAt: Date;
    name?: string; // Make name optional to allow undefined but always provide a fallback in the UI
    folderID?: string; 
}
