// Canvas Object Types
export type IconType = 
  | 'light' 
  | 'fixture' 
  | 'device' 
  | 'sensor' 
  | 'security-camera'
  | 'wall'
  | 'door'
  | 'right-arrow'
  | 'rectangle'
  | 'text';

export interface IconData {
  id: string;
  type: IconType;
  x: number;
  y: number;
  rotation: number;
  scale: {
    x: number;
    y: number;
  };
  text?: string;        // For text annotations
  isSelected?: boolean;
  customProperties?: Record<string, any>;
}

export interface IconConfig {
  type: IconType;
  path: string;
  defaultWidth: number;
  defaultHeight: number;
}

// Map of icon types to their configurations
export const ICON_CONFIGS: Record<IconType, IconConfig> = {
  light: {
    type: 'light',
    path: '/light.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  fixture: {
    type: 'fixture',
    path: '/fixture.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  device: {
    type: 'device',
    path: '/device.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  sensor: {
    type: 'sensor',
    path: '/sensor.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  'security-camera': {
    type: 'security-camera',
    path: '/security-camera.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  wall: {
    type: 'wall',
    path: '/wall.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  door: {
    type: 'door',
    path: '/door.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  'right-arrow': {
    type: 'right-arrow',
    path: '/right-arrow.png',
    defaultWidth: 40,
    defaultHeight: 40
  },
  rectangle: {
    type: 'rectangle',
    path: '', // Rectangles don't need an image path
    defaultWidth: 50,
    defaultHeight: 60
  },
  text: {
    type: 'text',
    path: '', // Text doesn't need an image path
    defaultWidth: 100,
    defaultHeight: 20
  }
};

// You can add more interfaces/types here as needed
export interface FloorPlanDocument {
  id: string;
  iconData: IconData[];
  pdfUrl: string;
  lastModified: any; // Firebase Timestamp
  lastModifiedBy: string;
  fileName: string;
  createdAt: any; // Firebase Timestamp
}
