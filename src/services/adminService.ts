import api from '@/lib/api'
import { ApiResponse, User, Course } from '@/types'

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface AdminDashboardStats {
  users: {
    totalUsers: number;
    studentCount: number;
    instructorCount: number;
    adminCount: number;
    recentRegistrations: number;
    activeUsers: number;
    inactiveUsers: number;
  };
  courses: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    archivedCourses: number;
    categories: Array<{ _id: string; count: number }>;
    popularCourses: Array<{ title: string; enrollmentCount: number }>;
    recentCourses: number;
  };
  enrollments: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    droppedEnrollments: number;
    recentEnrollments: number;
    enrollmentTrend: Array<{ date: string; count: number }>;
    paymentMethods: Array<{ _id: string; count: number }>;
  };
}

export const adminService = {
  // Get all users
  getAllUsers: async () => {
    try {
      console.log('Fetching all users as admin');
      
      const response = await api.get<ApiResponse<{ items: User[]; pagination: PaginationInfo }>>('/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 100, // Get more users for admin view
          page: 1
        }
      });
      
      console.log('Users API response:', response.data);
      
      // Handle paginated response structure
      if (response.data.data && response.data.data.items) {
        console.log('Users found (paginated):', response.data.data.items.length);
        return response.data.data.items;
      }
      
      // Fallback for non-paginated response
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Users found (direct array):', response.data.data.length);
        return response.data.data;
      }
      
      // Fallback for different response formats
      if (Array.isArray(response.data)) {
        console.log('Users found (raw array):', response.data.length);
        return response.data;
      }
      
      console.log('No users data found in response');
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Toggle user status (activate/deactivate)
  toggleUserStatus: async (userId: string) => {
    try {
      console.log(`Toggling status for user: ${userId}`);
      
      const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/toggle-status`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.data) {
        return response.data.data;
      }
      
      return response.data as unknown as User;
    } catch (error) {
      console.error(`Error toggling user status for ${userId}:`, error);
      throw error;
    }
  },
  
  // Delete user
  deleteUser: async (userId: string) => {
    try {
      console.log(`Deleting user: ${userId}`);
      
      await api.delete(`/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },
  
  // Delete course (admin only)
  deleteCourse: async (courseId: string) => {
    try {
      console.log(`Admin deleting course: ${courseId}`);
      
      await api.delete(`/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error);
      throw error;
    }
  },
  
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      console.log('Fetching admin dashboard statistics');
      
      const response = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Dashboard stats API response:', response.data);
      
      // Handle the response structure
      if (response.data.data) {
        return response.data.data;
      }
      
      // Fallback
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get all courses (admin view)
  getAllCourses: async () => {
    try {
      console.log('Fetching all courses as admin');
      
      const response = await api.get<ApiResponse<{ items: Course[]; pagination: PaginationInfo }>>('/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 100, // Get more courses for admin view
          page: 1,
          includeInactive: true // Include unpublished courses
        }
      });
      
      console.log('Courses API response:', response.data);
      
      // Handle paginated response structure
      if (response.data.data && response.data.data.items) {
        console.log('Courses found (paginated):', response.data.data.items.length);
        return response.data.data.items;
      }
      
      // Fallback for non-paginated response
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Courses found (direct array):', response.data.data.length);
        return response.data.data;
      }
      
      // Fallback for different response formats
      if (Array.isArray(response.data)) {
        console.log('Courses found (raw array):', response.data.length);
        return response.data;
      }
      
      console.log('No courses data found in response');
      return [];
    } catch (error) {
      console.error('Error fetching courses for admin:', error);
      throw error;
    }
  }
};

export default adminService;
