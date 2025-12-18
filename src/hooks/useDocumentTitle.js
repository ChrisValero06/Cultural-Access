import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? title : 'Cultural Access';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default useDocumentTitle;

