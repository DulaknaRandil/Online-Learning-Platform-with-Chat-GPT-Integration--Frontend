import api from '@/lib/api'
import { ApiResponse, Enrollment, PaginatedResponse } from '@/types'

export const enrollmentService = {
  // Enroll in a course (student only)
  enroll: async (courseId: string) => {
    try {
      const response = await api.post<ApiResponse<Enrollment>>('/enrollments', { courseId })
      console.log('Enrollment response:', response.data)
      
      if (response.data.data) {
        return response.data.data
      } 
      // Fallback to legacy format
      return response.data as unknown as Enrollment
    } catch (error) {
      console.error('Error enrolling in course:', error)
      throw error
    }
  },

  // Get my enrollments (student only)
  getMyEnrollments: async () => {
    try {
      console.log('Calling GET /enrollments/my-enrollments endpoint');
      const response = await api.get<PaginatedResponse<Enrollment> | ApiResponse<Enrollment[]>>('/enrollments/my-enrollments');
      console.log('Raw enrollments response:', response.data);
      
      // Handle paginated response format
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        console.log('Found data array in response:', response.data.data.length, 'enrollments');
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
    } catch (error) {
      console.error('Error getting enrollments:', error);
      
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
