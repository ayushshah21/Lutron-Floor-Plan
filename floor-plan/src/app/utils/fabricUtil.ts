// File for extending fabric.js objects to incorporate ids for deletion 
import { fabric } from 'fabric';

function generateCustomId() {
    return `object_${Date.now()}`;  // Use the current timestamp for customId
}

interface IExtendedRectOptions extends fabric.IRectOptions {
    customId?: string; // Add customId to the options interface
}

export class ExtendedRect extends fabric.Rect {
    customId?: string;  // Add customId property

    constructor(options?: IExtendedRectOptions) {
        super(options);
        this.customId = options?.customId || generateCustomId(); // Generate customId based on current date
    }
}

interface IExtendedGroupOptions extends fabric.IGroupOptions {
    customId?: string; 
}

export class ExtendedGroup extends fabric.Group {
    customId?: string;  
    constructor(items?: fabric.Object[], options?: IExtendedGroupOptions) {
        super(items, options);
        this.customId = options?.customId || generateCustomId(); // Generate customId based on current date
    }
}

interface IExtendedPathOptions extends fabric.IPathOptions {
    customId?: string;
}

export class ExtendedPath extends fabric.Path {
    customId?: string;

    constructor(path: string | any[], options?: IExtendedPathOptions) {
        super(path, options);
        this.customId = options?.customId || generateCustomId();
    }
}