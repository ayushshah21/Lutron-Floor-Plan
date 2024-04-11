"use client";
import { useEffect, useRef, useState } from "react";
import "./editor.css";
import { Upload } from "lucide-react"; // Assuming lucide-react is used for icons
import { useRouter, useSearchParams } from "next/navigation";
import useAuthRedirect from "../hooks/useAuthRedirect";
import loadDocument from "pspdfkit";

declare module "pspdfkit" {
  export function unload(container: HTMLElement): void;
  export function load(options: {
    container: HTMLElement;
    document: string;
    baseUrl: string;
  }): void;
}

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchParams = useSearchParams();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };
  useEffect(() => {
    if(!searchParams.get('pdf')) return;
    const url = String(searchParams.get('pdf'));
    setFileUrl(url);
  }, [searchParams])
  



  useEffect(() => {
    const container = containerRef.current;
    if (container && fileUrl && typeof window !== "undefined") {
      container.style.display = "block"; // Ensure the container is displayed
      container.style.height = "100vh"; // Set a specific height for the container

      import("pspdfkit").then((PSPDFKit) => {
        PSPDFKit.unload(container);
        PSPDFKit.load({
          container,
          document: fileUrl,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
        });
      });
    }

    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div className="app-container">
      <div
        className={`file-chooser-container ${
          fileUrl ? "file-chooser-small" : ""
        }`}
      >
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            className="file-input"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="file-label">
            <Upload className="upload-icon" size={24} />
            <span>{fileUrl ? "Change PDF" : "Select a PDF file"}</span>
          </label>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`pdf-viewer ${fileUrl ? "pdf-viewer-visible" : ""}`}
      />
    </div>
  );
};

export default App;
