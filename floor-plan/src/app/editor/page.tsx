// "use client";
// import { useEffect, useState } from "react";
// import { signOut, User } from "firebase/auth";
// import { auth } from "../../../firebase";
// import { Document, Page, pdfjs } from "react-pdf";
// import "./editor.css";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import useAuthRedirect from "../hooks/useAuthRedirect";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// interface HomeProps {
//   user: User | null;
//   setUser: (user: User | null) => void;
// }

// export default function Editor() {
//   // Store state of pdfFile
//   const [pdfFile, setPdfFile] = useState<File | null>(null);
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const searchParams = useSearchParams();
//   const queryPdf = searchParams.get("pdf");

//   const { isLoading } = useAuthRedirect();

//   const router = useRouter();

//   useEffect(() => {
//     // Use the searchParams to get the 'pdf' query parameter
//     if (queryPdf) {
//       setPdfUrl(queryPdf);
//     }
//   }, [searchParams]);

//   const signOutWithGoogle = async () => {
//     try {
//       await signOut(auth); // Sign out from Firebase Auth
//       router.push("/login"); // Redirect to the login page after signing out
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Checks file type and if it is a pdf
//   const handleFileChange = (event: any) => {
//     const file = event.target.files[0];
//     if (file && file.type === "application/pdf") {
//       setPdfFile(file);
//     } else {
//       alert("Please select a valid PDF file.");
//     }
//   };

//   const handleDownload = () => {
//     if (!pdfFile) {
//       alert("No PDF file selected.");
//       return;
//     }

//     // Create a URL for the PDF file
//     const fileUrl = URL.createObjectURL(pdfFile);
//     // Create a temporary anchor element
//     const a = document.createElement("a");
//     a.download = pdfFile.name;
//     a.href = fileUrl;
//     document.body.appendChild(a);
//     // Trigger the download by simulating a click on the anchor
//     a.click();
//     // Clean up by revoking the object URL and removing the anchor from the document
//     URL.revokeObjectURL(fileUrl);
//     document.body.removeChild(a);
//   };

//   return isLoading ? (
//     <div>Loading...</div>
//   ) : (
//     <main className="main">
//       <nav className="navbar">
//         <img
//           className="lutronLogo"
//           src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
//           alt="Lutron-logo"
//         />
//         <h1 className="navbarBrand">Test Floor Plan #1 </h1>
//         <ul className="navbarNav">
//           <li className="navbarItem">
//             <button className="button" onClick={() => signOutWithGoogle()}>
//               Logout
//             </button>
//           </li>
//         </ul>
//       </nav>

//       {/* Put side tool bar over here, and make it appear to the left of the canvas box */}
//       <div className="sideToolBar">
//         <form>
//           <input
//             type="file"
//             onChange={handleFileChange}
//             accept="application/pdf"
//           />
//         </form>
//         <button onClick={handleDownload}>Export</button>
//       </div>

//       <div className="canvasBox">
//         {/* Displays pdf*/}
//         {/* Add feature to zoom in and zoom out of pdf */}
//         {pdfUrl && <iframe src={pdfUrl} width="100%" height="700px"></iframe>}
//          {pdfFile && (
//           <iframe src={URL.createObjectURL(pdfFile)} width="100%" height="700px"></iframe>
//         )}
//         {pdfFile && (
//           <Document file={URL.createObjectURL(pdfFile)}>
//             <Page
//               pageNumber={1}
//               renderAnnotationLayer={false}
//               renderTextLayer={false}
//             />
//           </Document>
//         )}
//       </div>
//     </main>
//   );
// }

"use client";
import { useEffect, useRef, useState } from "react";

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container && fileUrl && typeof window !== "undefined") {
      import("pspdfkit").then((PSPDFKit) => {
        PSPDFKit.unload(container); // Ensure any previously loaded documents are unloaded
        PSPDFKit.load({
          container,
          document: fileUrl,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
        });
      });
    }

    // Cleanup function to revoke the object URL when the component unmounts or the file changes
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]); // Depend on `fileUrl` so the effect runs when a new file is selected

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="application/pdf" />
      <div ref={containerRef} style={{ height: "100vh" }} />
    </div>
  );
};

export default App;
