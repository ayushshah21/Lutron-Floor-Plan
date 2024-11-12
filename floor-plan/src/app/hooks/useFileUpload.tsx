// hooks/useFileUpload.tsx
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction } from 'react';

const useFileUpload = (
  setPdfFile: Dispatch<SetStateAction<File | null>>,
  selectedFolder: string | null,
  uploadPdf: (file: File, folderId: string) => Promise<{ pdfURL: string, documentId: string } | null>
) => {
  const router = useRouter();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);

      const folderId = selectedFolder || '4';
      const result = await uploadPdf(file, folderId);
      if (result) {
        const { pdfURL, documentId } = result;
        router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}&documentID=${documentId}&fileName=${encodeURIComponent(file.name)}`);
      } else {
        alert('Failed to upload PDF.');
      }
    }
  };

  return handleFileChange;
};

export default useFileUpload;
