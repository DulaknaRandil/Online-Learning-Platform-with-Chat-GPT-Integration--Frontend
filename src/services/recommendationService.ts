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
  gptResponse?: string;
  totalRecommendations?: number;
  matchedCourses?: number;
  fallback?: boolean;
  data?: unknown; // Support for nested data structure
  success?: boolean;
  message?: string | Record<string, unknown>; // Support for backend message structure
  apiUsage?: {
    totalRequests: number;
    maxRequests: number;
    remainingRequests: number;
    requestsInLastMinute: number;
  };
}

// Backend response format
interface BackendRecommendationResponse {
  success: boolean;
  message: {
    prompt: string;
    recommendations: Course[];
    gptResponse?: string;
    textResponse?: string;
    totalRecommendations: number;
    matchedCourses: number;
    fallback: boolean;
  };
  data: string;
  statusCode: number;
  timestamp: string;
}

export const recommendationService = {
  // Get AI-powered chat recommendations
  getChatRecommendations: async (query: string, limit = 5) => {
    try {
      console.log('Requesting chat recommendations with query:', query);
      const response = await api.post<BackendRecommendationResponse>('/recommendations/chat', { query, limit });
      
      console.log('Chat recommendations response:', response.data);
      
      // Handle the actual backend response format
      if (response.data.success && response.data.message) {
        const backendData = response.data.message;
        
        return {
          query: backendData.prompt || query,
          courses: backendData.recommendations || [],
          aiGenerated: true,
          gptResponse: backendData.gptResponse || backendData.textResponse,
          totalRecommendations: backendData.totalRecommendations || 0,
          matchedCourses: backendData.matchedCourses || 0,
          fallback: backendData.fallback || false
        } as ChatRecommendationResponse;
      }
      
      // Fallback for other response formats
      return {
        query: query,
        courses: [],
        aiGenerated: false
      };
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
