import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

interface UseErrorHandlerReturn {
  handleError: (error: Error | unknown, options?: ErrorHandlerOptions) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>;
}

/**
 * Custom hook untuk menangani error secara konsisten di seluruh aplikasi
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback(
    (error: Error | unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        logError = true,
        fallbackMessage = 'Terjadi kesalahan yang tidak terduga'
      } = options;

      // Log error untuk debugging
      if (logError) {
        console.error('Error caught by useErrorHandler:', error);
      }

      // Ekstrak pesan error
      let errorMessage = fallbackMessage;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }

      // Tampilkan toast notification
      if (showToast) {
        toast.error(errorMessage);
      }
    },
    []
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, options);
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError
  };
};

/**
 * Higher-order function untuk wrap async functions dengan error handling
 */
export const withErrorHandler = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options?: ErrorHandlerOptions
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const {
        showToast = true,
        logError = true,
        fallbackMessage = 'Terjadi kesalahan yang tidak terduga'
      } = options || {};

      if (logError) {
        console.error('Error in wrapped function:', error);
      }

      let errorMessage = fallbackMessage;
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return null;
    }
  };
};

/**
 * Utility function untuk menangani API errors
 */
export const handleApiError = (error: unknown): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Permintaan tidak valid';
      case 401:
        return 'Anda tidak memiliki akses';
      case 403:
        return 'Akses ditolak';
      case 404:
        return 'Data tidak ditemukan';
      case 500:
        return 'Terjadi kesalahan server';
      default:
        return 'Terjadi kesalahan jaringan';
    }
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Terjadi kesalahan yang tidak terduga';
};