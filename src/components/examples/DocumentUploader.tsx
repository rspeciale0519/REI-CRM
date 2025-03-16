import React, { useEffect, useState } from 'react';
import { Document } from '@/types/database.types';
import { DocumentService } from '@/services/document.service';

// Initialize the document service
const documentService = new DocumentService();

interface DocumentUploaderProps {
  // Optional related entity IDs
  dealId?: string;
  contactId?: string;
  propertyId?: string;
}

export default function DocumentUploader({
  dealId,
  contactId,
  propertyId,
}: DocumentUploaderProps) {
  // State for documents and loading status
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, [dealId, contactId, propertyId]);

  // Function to load documents
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await documentService.getByRelatedEntity({
        dealId,
        contactId,
        propertyId,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setDocuments(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadProgress(true);
    setError(null);

    try {
      // Upload each file
      for (const file of files) {
        const response = await documentService.uploadDocument({
          file,
          dealId,
          contactId,
          propertyId,
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Add the new document to the list
        if (response.data) {
          setDocuments(prev => [response.data!, ...prev]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploadProgress(false);
      event.target.value = ''; // Reset file input
    }
  };

  // Function to handle document deletion
  const handleDelete = async (documentId: string) => {
    try {
      const response = await documentService.deleteDocument(documentId);
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Remove the document from the list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={uploadProgress}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {uploadProgress ? 'Uploading...' : 'Upload Documents'}
        </label>
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here or click to select files
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          Error: {error}
        </div>
      )}

      {/* Documents list */}
      <div className="space-y-4">
        {documents.map(document => (
          <div
            key={document.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div className="flex items-center space-x-4">
              {/* Document icon based on type */}
              <div className="text-gray-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>

              <div>
                <h3 className="font-medium">{document.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(document.file_size || 0)}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                View
              </a>
              <button
                onClick={() => handleDelete(document.id)}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <p className="text-center text-gray-500">No documents uploaded yet</p>
        )}
      </div>
    </div>
  );
} 