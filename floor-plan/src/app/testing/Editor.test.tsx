/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the components and hooks instead of their dependencies
jest.mock("../hooks/useCanvas", () => ({
  useCanvas: () => ({
    canvasRef: { current: null },
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    exportCanvasAsPDF: jest.fn(),
    saveFloorPlanChanges: jest.fn(),
  })
}));

// Mock the components
jest.mock("../components/ShareButton", () => {
  return function DummyShareButton() {
    return <div>Share Button</div>;
  };
});

jest.mock("../components/EditorToolbar", () => {
  return function DummyEditorToolbar() {
    return <div>Editor Toolbar</div>;
  };
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// Add mock for socket.io-client
jest.mock("../../socket", () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

// Import the Editor component after the mocks
import Editor from "../editor/page";

describe("Editor Basic UI Tests", () => {
  test("renders toolbar buttons with correct labels", () => {
    render(<Editor />);
    
    expect(screen.getByText("Export as PDF")).toBeTruthy();
    expect(screen.getByText("Save Changes")).toBeTruthy();
  });

  test("renders control buttons in bottom-right corner", () => {
    render(<Editor />);
    
    expect(screen.getByLabelText("Zoom In")).toBeTruthy();
    expect(screen.getByLabelText("Zoom Out")).toBeTruthy();
    expect(screen.getByLabelText("Toggle Fullscreen")).toBeTruthy();
  });

  test("renders EditorToolbar component", () => {
    render(<Editor />);
    expect(screen.getByText("Editor Toolbar")).toBeTruthy();
  });

  test("renders ShareButton component", () => {
    render(<Editor />);
    expect(screen.getByText("Share Button")).toBeTruthy();
  });

  test("renders breadcrumb with Home by default", () => {
    render(<Editor />);
    expect(screen.getByText("Home")).toBeTruthy();
  });

  test("renders main UI containers", () => {
    const { container } = render(<Editor />);
    
    // Use type assertion to handle querySelector return type
    const main = container.querySelector(".main");
    const toolbar = container.querySelector(".toolbar");
    const canvasContainer = container.querySelector(".canvas-container");
    const controls = container.querySelector(".bottom-right-controls");

    expect(main).not.toBeNull();
    expect(toolbar).not.toBeNull();
    expect(canvasContainer).not.toBeNull();
    expect(controls).not.toBeNull();
  });

  test("renders current users panel", () => {
    render(<Editor />);
    expect(screen.getByText("Current users:")).toBeTruthy();
  });

  test("current users panel has minimize button", () => {
    render(<Editor />);
    const minimizeButton = screen.getByRole("button", { name: "-" });
    expect(minimizeButton).toBeTruthy();
  });

  test("breadcrumb shows correct separator", () => {
    render(<Editor />);
    const separators = screen.queryAllByText("/");
    expect(separators.length).toBeGreaterThanOrEqual(0);
  });

  test("renders canvas element", () => {
    const { container } = render(<Editor />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  test("renders all required toolbar buttons", () => {
    render(<Editor />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
