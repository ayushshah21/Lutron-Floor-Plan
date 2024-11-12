// hooks/useGenerateThumbnails.tsx
import { useState, useEffect } from 'react';
import pdfjsLib from 'pdfjs-dist';

const useGenerateThumbnails = (floorPlans: Array<{ id: string; pdfURL?: string }>) => {
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});

  const renderThumbnail = async (pdfUrl: string) => {
    try {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      const scale = 0.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        return canvas.toDataURL();
      }
    } catch (error) {
      console.error('Error rendering PDF thumbnail:', error);
    }
    return null;
  };

  useEffect(() => {
    const generateThumbnails = async () => {
      const thumbnailsData: { [key: string]: string } = {};
      for (const file of floorPlans) {
        if (file.pdfURL) {
          const thumbnailUrl = await renderThumbnail(file.pdfURL);
          if (thumbnailUrl) {
            thumbnailsData[file.id] = thumbnailUrl;
          }
        }
      }
      setThumbnails(thumbnailsData);
    };
    generateThumbnails();
  }, [floorPlans]);

  return thumbnails;
};

export default useGenerateThumbnails;
