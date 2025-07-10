import api from '@/lib/api'
import { ApiResponse, Enrollment, PaginatedResponse } from '@/types'

// Mock data for development or when the API is not ready
const mockEnrollmentData: Enrollment[] = [
  {
    _id: '60d21b4667d0d8992e610c85',
    student: {
      _id: '60d21b4667d0d8992e610c80',
      username: 'John Smith',
      email: 'student@example.com',
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    course: {
      _id: '60d21b4667d0d8992e610c82',
      title: 'Introduction to JavaScript',
      description: 'Learn the basics of JavaScript programming',
      instructor: {
        _id: '60d21b4667d0d8992e610c81',
        username: 'Jane Doe',
        email: 'instructor@example.com',
        role: 'instructor' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      category: 'Programming',
      difficulty: 'beginner' as const,
      status: 'published' as const,
      price: 49.99,
      duration: 12,
      enrollmentCount: 120,
      lessons: [],
      tags: ['JavaScript', 'Web Development', 'Programming'],
      prerequisites: ['Basic HTML knowledge'],
      learningOutcomes: ['Understand JavaScript fundamentals', 'Write simple JavaScript programs'],
      enrolledStudents: 120,
      rating: { average: 4.5, count: 45 },
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    enrollmentDate: new Date(),
    status: 'in-progress',
    progress: { completedLessons: [], percentage: 35 },
    certificateIssued: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    student: {
      _id: '60d21b4667d0d8992e610c80',
      username: 'John Smith',
      email: 'student@example.com',
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    course: {
      _id: '60d21b4667d0d8992e610c83',
      title: 'Advanced CSS Techniques',
      description: 'Master advanced CSS and animations',
      instructor: {
        _id: '60d21b4667d0d8992e610c81',
        username: 'Jane Doe',
        email: 'instructor@example.com',
        role: 'instructor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      category: 'Web Development',
      difficulty: 'intermediate' as const,
      status: 'published' as const,
      price: 69.99,
      duration: 15,
      enrollmentCount: 85,
      lessons: [],
      tags: ['CSS', 'Web Development', 'Animation'],
      prerequisites: ['Basic CSS knowledge'],
      learningOutcomes: ['Create advanced CSS animations', 'Master CSS Grid and Flexbox'],
      enrolledStudents: 85,
      rating: { average: 4.8, count: 32 },
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    enrollmentDate: new Date(),
    status: 'completed',
    progress: { 
      completedLessons: [
        { lessonId: '1', completedAt: new Date() },
        { lessonId: '2', completedAt: new Date() },
      ], 
      percentage: 100 
    },
    completionDate: new Date(),
    certificateIssued: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

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
      console.log('Calling GET /enrollments/my endpoint');
      const response = await api.get<PaginatedResponse<Enrollment> | ApiResponse<Enrollment[]>>('/enrollments/my');
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
      
      // For demonstration or development, return mock data if the API isn't ready
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock enrollment data for development');
        return mockEnrollmentData;
      }
      
      console.log('No enrollment data found in response, returning empty array');
      return [];
    } catch (error) {
      console.error('Error getting enrollments:', error);
      
      // For demonstration or development, return mock data if the API isn't ready
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock enrollment data after error');
        return mockEnrollmentData;
      }
      
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
