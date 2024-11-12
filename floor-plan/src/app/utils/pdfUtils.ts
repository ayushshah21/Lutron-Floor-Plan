// utils/pdfUtils.ts
import pdfjsLib from 'pdfjs-dist';

export const renderThumbnail = async (pdfUrl: string): Promise<string | null> => {
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
