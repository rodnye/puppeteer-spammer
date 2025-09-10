import { useState } from 'react';

export const useStatus = (initialLoading = true) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return {
    loading,
    error,
    success,
    set(status: 'LOADING' | 'ERROR' | 'SUCCESS', message: string | Error = '') {
      switch (status) {
        case 'LOADING':
          setLoading(true);
          break;
        case 'ERROR':
          setLoading(false);
          setSuccess(null);
          setError(message instanceof Error ? message.message : message);
          break;
        case 'SUCCESS':
          setLoading(false);
          setError(null);
          setSuccess(message as string);
      }
    },
  };
};
