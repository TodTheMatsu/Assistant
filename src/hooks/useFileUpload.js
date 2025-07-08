import { useState, useCallback } from 'react';
import { readFileContent } from '../utils/fileUtils.js';

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    const filePromises = files.map(async (file) => {
      const fileData = {
        file: file,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size
      };

      if (file.type.startsWith('image/')) {
        // For images, create a preview
        const reader = new FileReader();
        const preview = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        fileData.preview = preview;
      } else {
        // For other files, store the file type for icon display
        fileData.type = 'file';
      }

      return fileData;
    });

    const processedFiles = await Promise.all(filePromises);
    setSelectedFiles(prev => [...prev, ...processedFiles]);
    
    // Clear the input
    event.target.value = '';
  }, []);

  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if the item is an image
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // Prevent default paste behavior
        
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileData = {
              file: file,
              name: `pasted-image-${Date.now()}.${file.type.split('/')[1]}`,
              type: 'image',
              preview: event.target.result,
              size: file.size
            };
            setSelectedFiles(prev => [...prev, fileData]);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  const removeFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const processFilesForAI = useCallback(async () => {
    const messageParts = [];
    
    for (const fileData of selectedFiles) {
      if (fileData.type === 'image') {
        // For images, convert to the format expected by Gemini
        const base64Data = fileData.preview.split(',')[1]; // Remove data:image/...;base64, prefix
        messageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: fileData.file.type
          }
        });
      } else {
        // For non-image files, read content and add as text for AI processing
        try {
          const fileContent = await readFileContent(fileData.file);
          messageParts.push({
            text: `\n\n[File: ${fileData.name}]\n${fileContent}\n[End of ${fileData.name}]\n`
          });
        } catch (error) {
          console.error('Error reading file:', fileData.name, error);
          messageParts.push({
            text: `\n\n[File: ${fileData.name} - Error reading file content]\n`
          });
        }
      }
    }
    
    return messageParts;
  }, [selectedFiles]);

  return {
    selectedFiles,
    handleFileSelect,
    handlePaste,
    removeFile,
    clearFiles,
    processFilesForAI
  };
};
