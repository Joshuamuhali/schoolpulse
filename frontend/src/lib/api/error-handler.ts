import { toast } from 'sonner'

export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'STATE_INVALID'
  | 'NETWORK_ERROR'
  | 'PARTIAL_SUCCESS'
  | 'UNKNOWN_ERROR'

export interface APIError {
  type: ErrorType
  message: string
  details?: any
}

export class APIErrorHandler {
  static handle(error: string | Error | APIError): APIError {
    if (typeof error === 'string') {
      return {
        type: 'UNKNOWN_ERROR',
        message: error,
      }
    }

    if (error instanceof Error) {
      // Check for common REST API error patterns
      if (error.message.includes('permission denied') || error.message.includes('403')) {
        return {
          type: 'PERMISSION_DENIED',
          message: 'You do not have permission to perform this action',
        }
      }

      if (error.message.includes('network') || error.message.includes('fetch')) {
        return {
          type: 'NETWORK_ERROR',
          message: 'Network connection error. Please check your internet connection.',
        }
      }

      if (error.message.includes('validation')) {
        return {
          type: 'VALIDATION_ERROR',
          message: 'Invalid data provided',
        }
      }

      return {
        type: 'UNKNOWN_ERROR',
        message: error.message,
      }
    }

    return error
  }

  static showError(error: APIError): void {
    switch (error.type) {
      case 'PERMISSION_DENIED':
        toast.error('Access Denied', {
          description: error.message,
        })
        break
      case 'VALIDATION_ERROR':
        toast.error('Validation Error', {
          description: error.message,
        })
        break
      case 'NETWORK_ERROR':
        toast.error('Connection Error', {
          description: error.message,
        })
        break
      case 'STATE_INVALID':
        toast.error('System Error', {
          description: 'This action is not allowed in the current system state',
        })
        break
      case 'PARTIAL_SUCCESS':
        toast.warning('Partial Success', {
          description: error.message,
        })
        break
      default:
        toast.error('Error', {
          description: error.message || 'An unexpected error occurred',
        })
    }
  }

  static logError(error: APIError, context?: any): void {
    console.error('API Error:', {
      type: error.type,
      message: error.message,
      details: error.details,
      context,
      timestamp: new Date().toISOString(),
    })
  }
}

// React hook for handling API errors
export function useErrorHandler() {
  const handleError = (error: string | Error | APIError, context?: any) => {
    const apiError = APIErrorHandler.handle(error)
    APIErrorHandler.showError(apiError)
    APIErrorHandler.logError(apiError, context)
    return apiError
  }

  return { handleError }
}
