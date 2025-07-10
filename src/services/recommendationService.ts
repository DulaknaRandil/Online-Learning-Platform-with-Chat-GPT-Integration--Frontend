import api from '@/lib/api'

// Define interfaces for the response types
export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  instructor: {
    _id: string;
    username: string;
  };
  recommendationScore: number;
  recommendationReason: string;
  thumbnail?: string;
  enrollmentCount?: number;
  rating?: {
    average: number;
    count: number;
  };
}

export interface ChatRecommendationResponse {
  query: string;
  courses: Course[];
  aiGenerated: boolean;
  apiUsage?: {
    totalRequests: number;
    maxRequests: number;
    remainingRequests: number;
    requestsInLastMinute: number;
  };
}

export const recommendationService = {
  // Get AI-powered chat recommendations
  getChatRecommendations: async (query: string, limit = 5) => {
    try {
      const response = await api.post<ChatRecommendationResponse>('/recommendations/chat', { query, limit });
      return response.data;
    } catch (error) {
      console.error('Error getting chat recommendations:', error);
      
      // Return empty response if API fails
      return {
        query: query,
        courses: [],
        aiGenerated: false
      };
    }
  },
  
  // Get trending courses
  getTrendingCourses: async (limit = 10) => {
    try {
      const response = await api.get<{ data: Course[] }>(`/recommendations/trending?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting trending courses:', error);
      return [];
    }
  },
  
  // Get personalized recommendations (for logged-in users)
  getPersonalizedRecommendations: async (limit = 10) => {
    try {
      const response = await api.get<{ data: Course[] }>(`/recommendations/personalized?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  },
  
  // Get similar courses
  getSimilarCourses: async (courseId: string, limit = 5) => {
    try {
      const response = await api.get<{ data: Course[] }>(`/recommendations/similar/${courseId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting similar courses:', error);
      return [];
    }
  }
};
