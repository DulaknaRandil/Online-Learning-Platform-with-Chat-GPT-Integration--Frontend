'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { recommendationService, ChatRecommendationResponse } from '@/services/recommendationService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Send, User, Bot, Lightbulb, Star, Clock, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export default function RecommendationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [recommendationResponse, setRecommendationResponse] = useState<ChatRecommendationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setRecommendationResponse(null)

    try {
      const response = await recommendationService.getChatRecommendations(query)
      setRecommendationResponse(response)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to get recommendations. Please try again.'
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const examplePrompts = [
    "I want to become a software engineer, what courses should I take?",
    "Recommend courses for data science beginners",
    "What should I learn to become a full-stack developer?",
    "I'm interested in machine learning and AI",
    "Help me learn web development from scratch"
  ]

  const viewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center relative">
        <div className="absolute inset-x-0 -top-16 flex justify-center opacity-70">
          <div className="w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        <div className="flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-md"></div>
          <Sparkles className="h-8 w-8 text-blue-600 mr-2 relative z-10 animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent relative z-10">
            AI Course Recommendations
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Get personalized course recommendations powered by AI
        </p>
        
        {/* Role-specific messaging */}
        {user.role === 'student' && (
          <div className="mt-4 text-sm bg-blue-50 p-3 rounded-lg inline-block">
            Find the perfect courses for your learning journey and career goals
          </div>
        )}
        {user.role === 'instructor' && (
          <div className="mt-4 text-sm bg-green-50 p-3 rounded-lg inline-block">
            Discover what courses are in demand to guide your course creation
          </div>
        )}
        {user.role === 'admin' && (
          <div className="mt-4 text-sm bg-purple-50 p-3 rounded-lg inline-block">
            Analyze trending topics to improve the platform&apos;s course offerings
          </div>
        )}
      </div>

      <Card className="backdrop-blur-lg border-blue-100 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-500 rounded-full opacity-5 blur-3xl"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-[1px]"></div>
              <Bot className="h-5 w-5 text-white relative z-10" />
            </div>
            Ask AI for Course Recommendations
          </CardTitle>
          <CardDescription>
            Describe your learning goals, interests, or career aspirations, and get tailored course suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to learn?
              </label>
              <Textarea
                id="query"
                placeholder="e.g., I want to become a software engineer, what courses should I take?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[120px] backdrop-blur-sm bg-opacity-70 border-blue-200 focus:border-blue-400 rounded-xl shadow-inner"
                required
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()} className="w-full" size="lg">
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting recommendations...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Get AI Recommendations
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Example Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Example Questions
          </CardTitle>
          <CardDescription>
            Not sure what to ask? Try one of these example prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-blue-600 font-medium">&quot;{example}&quot;</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Display */}
      {recommendationResponse?.courses && recommendationResponse.courses.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Bot className="h-5 w-5 mr-2" />
              AI Recommendations for: &quot;{recommendationResponse.query}&quot;
            </CardTitle>
            {recommendationResponse.aiGenerated && (
              <CardDescription>
                <div className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                  <span>Generated using AI analysis</span>
                </div>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendationResponse.courses.map((course) => (
                <Card key={course._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/4 bg-blue-50 p-4 flex flex-col justify-center items-center">
                      <div className="bg-blue-100 p-3 rounded-full mb-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {course.category}
                      </Badge>
                      <Badge variant="outline">
                        {course.difficulty}
                      </Badge>
                    </div>
                    <div className="sm:w-3/4 p-4">
                      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <User className="h-3 w-3 mr-1" />
                        <span className="mr-4">By {course.instructor?.username || 'Instructor'}</span>
                        {course.rating?.average && (
                          <>
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            <span className="mr-4">{course.rating.average.toFixed(1)} ({course.rating.count})</span>
                          </>
                        )}
                        {course.enrollmentCount !== undefined && (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{course.enrollmentCount} enrolled</span>
                          </>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-1">Why this course:</div>
                        <div className="text-sm italic text-gray-600">{course.recommendationReason}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button 
                          onClick={() => viewCourse(course._id)}
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          View Course
                        </Button>
                        <div className="text-sm text-gray-500">
                          Relevance: {Math.round(course.recommendationScore * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {recommendationResponse.apiUsage && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p>API Usage: {recommendationResponse.apiUsage.totalRequests}/{recommendationResponse.apiUsage.maxRequests} requests made</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">1. Tell us your goals</h4>
                <p className="text-gray-600">Describe what you want to learn or achieve</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">2. AI analyzes your needs</h4>
                <p className="text-gray-600">Our AI processes your request and matches it with available courses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">3. Get personalized recommendations</h4>
                <p className="text-gray-600">Receive tailored course suggestions with explanations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
