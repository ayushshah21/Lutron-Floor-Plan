import { fabric } from 'fabric';

function generateCustomId() {
    return `object_${Date.now()}`;  // Use the current timestamp for customId
}

interface IExtendedRectOptions extends fabric.IRectOptions {
    isOriginal?: boolean;
    customId?: string; // Add customId to the options interface
}

export class ExtendedRect extends fabric.Rect {
    isOriginal?: boolean;
    customId?: string;  // Add customId property

    constructor(options?: IExtendedRectOptions) {
        super(options);
        this.isOriginal = options?.isOriginal;
        this.customId = options?.customId || generateCustomId(); // Generate customId based on current date
    }
}

interface IExtendedGroupOptions extends fabric.IGroupOptions {
    isOriginal?: boolean;
    customId?: string; // Add customId to the options interface
}

export class ExtendedGroup extends fabric.Group {
    isOriginal?: boolean;
    customId?: string;  // Add customId property

    constructor(items?: fabric.Object[], options?: IExtendedGroupOptions) {
        super(items, options);
        this.isOriginal = options?.isOriginal;
        this.customId = options?.customId || generateCustomId(); // Generate customId based on current date
    }
}
