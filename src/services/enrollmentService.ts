import api from '@/lib/api'
import { ApiResponse, Enrollment, PaginatedResponse } from '@/types'

export const enrollmentService = {
  // Enroll in a course (student only)
  enroll: async (courseId: string, paymentDetails?: Record<string, unknown>) => {
    try {
      console.log(`Attempting to enroll in course: ${courseId}`);
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in.');
      }
      
      // Prepare request data - include payment details if provided
      const requestData = paymentDetails 
        ? { courseId, paymentDetails } 
        : { courseId };
        
      console.log('Enrollment request data:', requestData);
      
      // Make the enrollment API call with token
      const response = await api.post<ApiResponse<Enrollment>>('/enrollments', 
        requestData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Enrollment successful:', response.data);
      
      if (response.data.data) {
        return response.data.data;
      }
      
      // Fallback to legacy format
      return response.data as unknown as Enrollment;
    } catch (error: unknown) {
      console.error('Error enrolling in course:', error);
      
      // Provide more helpful error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (axiosError.response?.status === 403) {
          throw new Error('You do not have permission to enroll in this course.');
        } else if (axiosError.response?.status === 409) {
          throw new Error('You are already enrolled in this course.');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      throw error;
    }
  },

  // Get my enrollments (student only)
  getMyEnrollments: async () => {
    try {
      console.log('Calling GET /enrollments/my-enrollments endpoint');
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await api.get<PaginatedResponse<Enrollment> | ApiResponse<Enrollment[]>>(
        '/enrollments/my-enrollments',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Raw enrollments response:', response.data);
      
      // Handle paginated response format (backend uses data.items)
      if (response.data && 'data' in response.data && response.data.data && 'items' in response.data.data) {
        const enrollments = response.data.data.items as Enrollment[];
        console.log('Found items array in paginated response:', enrollments.length, 'enrollments');
        
        // Debug the course data inside the enrollments
        if (enrollments.length > 0) {
          console.log('First enrollment course data:', enrollments[0].course);
        }
        
        return enrollments;
      }
      
      // Handle direct array response format
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        console.log('Found data array in response:', response.data.data.length, 'enrollments');
        
        // Debug the course data inside the enrollments
        if (response.data.data.length > 0) {
          console.log('First enrollment course data:', response.data.data[0].course);
        }
        
        return response.data.data;
      }
      
      // Handle legacy format
      if (response.data && 'enrollments' in response.data) {
        const enrollments = (response.data as { enrollments: Enrollment[] }).enrollments;
        console.log('Found enrollments array in legacy format:', enrollments.length, 'enrollments');
        return enrollments;
      }
      
      // Return empty array if API response is not in expected format
      console.log('No enrollment data found in response format');
      return [];
    } catch (error: unknown) {
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error getting enrollments:', errorMessage);
      
      // Log the error and return empty array
      console.log('Error getting enrollments, returning empty array');
      return [];
    }
  },

  // Get enrollment by ID (student only)
  getEnrollment: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Enrollment>>(`/enrollments/${id}`)
      console.log('Get enrollment response:', response.data)
      
      if (response.data.data) {
        return response.data.data
      }
      
      // Fallback to legacy format
      if ('enrollment' in response.data) {
        return (response.data as { enrollment: Enrollment }).enrollment
      }
      
      throw new Error('Could not retrieve enrollment data')
    } catch (error) {
      console.error(`Error getting enrollment with id ${id}:`, error)
      throw error
    }
  },
}
