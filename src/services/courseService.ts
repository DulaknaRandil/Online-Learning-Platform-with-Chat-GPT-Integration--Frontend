import api from '@/lib/api'
import { ApiResponse, Course, CreateCourseData, PaginatedResponse } from '@/types'

// This service handles all course related API calls
// Using MongoDB database via backend API

export const courseService = {
  // Get all courses
  getCourses: async (params?: Record<string, string>) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = `/courses${queryParams ? `?${queryParams}` : ''}`
      const response = await api.get<ApiResponse<PaginatedResponse<Course>>>(url)
      console.log('Get courses response:', response.data)
      
      // Standard API response format
      if ('data' in response.data) {
        return response.data.data as PaginatedResponse<Course>
      }
      
      // Legacy format - cast properly
      return response.data as unknown as PaginatedResponse<Course>
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  },

  // Get single course by ID
  getCourse: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Course> | { course: Course }>(`/courses/${id}`)
      console.log('Get course response:', response.data)
      
      // Standard API response format
      if ('data' in response.data) {
        return response.data.data as Course
      }
      
      // Legacy format
      return (response.data as { course: Course }).course
    } catch (error) {
      console.error(`Error fetching course with id ${id}:`, error)
      throw error
    }
  },

  // Get courses by instructor
  getInstructorCourses: async (instructorId: string) => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Course>> | { courses: Course[], totalPages: number, currentPage: number, total: number }>(`/courses/instructor/${instructorId}`)
      console.log('Get instructor courses response:', response.data)
      
      // Standard API response format
      if ('data' in response.data) {
        return response.data.data as PaginatedResponse<Course>
      }
      
      // Legacy format
      const legacyData = response.data as { courses: Course[], totalPages: number, currentPage: number, total: number }
      return {
        data: legacyData.courses,
        totalPages: legacyData.totalPages,
        currentPage: legacyData.currentPage,
        total: legacyData.total
      } as PaginatedResponse<Course>
    } catch (error) {
      console.error(`Error fetching courses for instructor ${instructorId}:`, error)
      throw error
    }
  },

  // Create course (instructor only)
  createCourse: async (data: CreateCourseData) => {
    try {
      const response = await api.post<ApiResponse<Course> | { course: Course }>('/courses', data)
      console.log('Create course response:', response.data)
      
      // Standard API response format
      if ('data' in response.data) {
        return response.data.data as Course
      }
      
      // Legacy format
      return (response.data as { course: Course }).course
    } catch (error) {
      console.error('Error creating course:', error)
      throw error
    }
  },

  // Update course (instructor only)
  updateCourse: async (id: string, data: Partial<CreateCourseData>) => {
    try {
      const response = await api.put<ApiResponse<Course> | { course: Course }>(`/courses/${id}`, data)
      console.log('Update course response:', response.data)
      
      // Standard API response format
      if ('data' in response.data) {
        return response.data.data as Course
      }
      
      // Legacy format
      return (response.data as { course: Course }).course
    } catch (error) {
      console.error(`Error updating course with id ${id}:`, error)
      throw error
    }
  },

  // Delete course (instructor only)
  deleteCourse: async (id: string) => {
    try {
      await api.delete(`/courses/${id}`)
      console.log(`Course ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting course with id ${id}:`, error)
      throw error
    }
  },

  // Publish/unpublish course (instructor only)
  togglePublish: async (id: string) => {
    try {
      const response = await api.patch<ApiResponse<Course> | { course: Course }>(`/courses/${id}/publish`)
      console.log('Toggle publish response:', response.data)
      
      // Standard API response format
      if ('data' in response.data) {
        return response.data.data as Course
      }
      
      // Legacy format
      return (response.data as { course: Course }).course
    } catch (error) {
      console.error(`Error toggling publish for course with id ${id}:`, error)
      throw error
    }
  }
}

export default courseService
