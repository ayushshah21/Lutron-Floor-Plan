import { fabric } from 'fabric';

interface IExtendedRectOptions extends fabric.IRectOptions {
	isOriginal?: boolean;
}

export class ExtendedRect extends fabric.Rect {
	isOriginal?: boolean;

	constructor(options?: IExtendedRectOptions) {
		super(options);
		this.isOriginal = options?.isOriginal;
	}
}
interface IExtendedGroupOptions extends fabric.IGroupOptions {
	isOriginal?: boolean;
}

export class ExtendedGroup extends fabric.Group {
	isOriginal?: boolean;

	constructor(items?: fabric.Object[], options?: IExtendedGroupOptions) {
		super(items, options);
		this.isOriginal = options?.isOriginal;
	}
}
