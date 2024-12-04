/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

// Mock the components and hooks
jest.mock("../hooks/useCanvas", () => ({
  useCanvas: () => ({
    canvasRef: { current: null },
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    exportCanvasAsPDF: jest.fn(),
    saveFloorPlanChanges: jest.fn(),
  })
}));

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

// Mock socket.io-client
jest.mock("../../socket", () => ({
  emit: jest.fn(),
  on: jest.fn((event, callback) => {
    if (event === 'userList') {
      callback(["test@example.com"]);
    }
  }),
  off: jest.fn(),
}));

// Mock firebase
jest.mock("../../../firebase", () => ({
  auth: {
    currentUser: {
      email: "test@example.com"
    }
  }
}));

import Editor from "../editor/page";

describe("Editor Basic UI Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(container.querySelector(".main")).toBeTruthy();
    expect(container.querySelector(".toolbar")).toBeTruthy();
    expect(container.querySelector(".canvas-container")).toBeTruthy();
    expect(container.querySelector(".bottom-right-controls")).toBeTruthy();
  });

  test("renders current users panel", () => {
    render(<Editor />);
    expect(screen.getByText("Current users:")).toBeTruthy();
  });

  test("renders minimize button in current users panel", () => {
    render(<Editor />);
    const minimizeButton = screen.getByRole("button", { name: "-" });
    expect(minimizeButton).toBeTruthy();
  });

  test("renders canvas element", () => {
    const { container } = render(<Editor />);
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  // User Profile Tests
  test("renders user profile", () => {
    const { container } = render(<Editor />);
    const userProfile = container.querySelector('.user-profile');
    expect(userProfile).toBeTruthy();
  });

  test("user profile contains user icon", () => {
    const { container } = render(<Editor />);
    const userProfile = container.querySelector('.user-profile');
    const svg = userProfile?.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  // Socket Connection Tests
  test("emits joinRoom event with correct data", () => {
    const socketMock = jest.requireMock("../../socket");
    render(<Editor />);
    
    expect(socketMock.emit).toHaveBeenCalledWith('joinRoom', {
      room_id: expect.any(String),
      username: expect.any(String)
    });
  });

  test("handles socket userList event", () => {
    render(<Editor />);
    const currentUsersPanel = screen.getByText("Current users:");
    expect(currentUsersPanel).toBeTruthy();
  });
});
