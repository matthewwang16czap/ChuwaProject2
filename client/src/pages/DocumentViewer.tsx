// DocumentViewer.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocument } from '../features/document/documentSlice';
import { RootState, AppDispatch } from '../app/store';

const DocumentViewer: React.FC = () => {
  const { userId, filename } = useParams<{ userId: string; filename: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { document, status, error } = useSelector((state: RootState) => state.document);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId && filename) {
      dispatch(fetchDocument({ userId, filename }));
    }
  }, [dispatch, userId, filename]);

  useEffect(() => {
    if (document) {
      // The document is a Blob, so create a Blob URL
      const url = URL.createObjectURL(document); // Create Blob URL from the fetched Blob
      setBlobUrl(url);

      // Cleanup the blob URL when the component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [document]);

  if (status === 'loading') return <div>Loading document...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div>
      {blobUrl ? (
        <iframe src={blobUrl} width="100%" height="600px" title={filename}></iframe>
      ) : (
        <div>No document found.</div>
      )}
    </div>
  );
};

export default DocumentViewer;
