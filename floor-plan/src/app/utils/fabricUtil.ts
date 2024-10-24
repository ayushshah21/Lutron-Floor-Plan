import { fabric } from 'fabric';

function generateCustomId() {
    return `object_${Date.now()}`;  
}

interface IExtendedRectOptions extends fabric.IRectOptions {
    customId?: string;   
    isOriginal?: boolean; 
}

export class ExtendedRect extends fabric.Rect {
    customId?: string;  
    isOriginal?: boolean; 

    constructor(options?: IExtendedRectOptions) {
        super(options);
        this.customId = options?.customId || generateCustomId();  
        this.isOriginal = options?.isOriginal || false;  
    }
}

interface IExtendedGroupOptions extends fabric.IGroupOptions {
    customId?: string; 
    isOriginal?: boolean;  
}

export class ExtendedGroup extends fabric.Group {
    customId?: string;  
    isOriginal?: boolean;  

    constructor(items?: fabric.Object[], options?: IExtendedGroupOptions) {
        super(items, options);
        this.customId = options?.customId || generateCustomId();  
        this.isOriginal = options?.isOriginal || false;  
    }
}

interface IExtendedPathOptions extends fabric.IPathOptions {
    customId?: string;
    isOriginal?: boolean; 
}

export class ExtendedPath extends fabric.Path {
    customId?: string;
    isOriginal?: boolean;  

    constructor(path: string | any[], options?: IExtendedPathOptions) {
        super(path, options);
        this.customId = options?.customId || generateCustomId();
        this.isOriginal = options?.isOriginal || false;  
    }
}

interface IExtendedTextOptions extends fabric.ITextOptions {
    customId?: string; 
}

export class ExtendedText extends fabric.IText {
    customId?: string;  

    constructor(text: string, options?: IExtendedTextOptions) {
        super(text, options);
        this.customId = options?.customId || generateCustomId();  
    }
}