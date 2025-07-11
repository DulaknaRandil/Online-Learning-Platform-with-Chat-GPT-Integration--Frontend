export interface User {
  _id: string
  id?: string
  username: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  avatar?: string
  bio?: string
  expertise?: string[]
  enrolledCourses?: string[]
  createdCourses?: string[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  _id: string
  title: string
  description: string
  instructor: User
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  level?: 'beginner' | 'intermediate' | 'advanced' // Some components use level instead of difficulty
  status: 'draft' | 'published' | 'archived'
  price: number
  duration: number
  thumbnail?: string
  lessons: Lesson[]
  tags: string[]
  prerequisites: string[]
  learningOutcomes: string[]
  enrollmentCount: number
  enrolledStudents: number
  rating: {
    average: number
    count: number
  }
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  _id: string
  title: string
  content: string
  videoUrl?: string
  duration: number
  order: number
  resources: Resource[]
}

export interface Resource {
  title: string
  url: string
  type: 'pdf' | 'video' | 'article' | 'quiz' | 'assignment'
}

export interface Enrollment {
  _id: string
  student: User
  course: Course
  enrollmentDate: Date
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped'
  progress: {
    completedLessons: Array<{
      lessonId: string
      completedAt: Date
    }>
    percentage: number
  }
  completionDate?: Date
  certificateIssued: boolean
  rating?: {
    score: number
    review: string
    ratedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    accessToken: string
    token?: string  // Alternative token name
    refreshToken?: string
  }
  // Direct response format options (for backwards compatibility)
  user?: User
  accessToken?: string
  token?: string  // Legacy format using 'token' instead of 'accessToken'
  refreshToken?: string
}

export interface ApiResponse<T> {
  data?: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
  currentPage: number
  total: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'student' | 'instructor'
  username?: string // Optional username field
}

export interface CreateCourseData {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: number
  thumbnail?: string
  tags: string[]
  prerequisites: string[] // Legacy field name 
  requirements: string[]  // New field name
  learningOutcomes: string[] // Legacy field name
  objectives: string[]    // New field name
  isPublished?: boolean
  language?: string       // Required field with default in backend
  status?: 'draft' | 'published' | 'archived'
}
