'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Lightbulb, 
  BookOpen, 
  User, 
  Star, 
  Clock, 
  Sparkles, 
  Target,
  Search,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Zap,
  AlertCircle
} from 'lucide-react';
import { recommendationService } from '@/services/recommendationService';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor?: {
    username: string;
  };
  category: string;
  difficulty: string;
  rating?: {
    average: number;
    count: number;
  };
  enrollmentCount?: number;
  recommendationReason?: string;
  recommendationScore?: number;
}

interface AISuggestedCourse {
  courseId: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationResponse {
  query: string;
  courses: Course[];
  aiGenerated: boolean;
  gptResponse?: string;
  apiUsage?: {
    totalRequests: number;
    maxRequests: number;
  };
}

const examplePrompts = [
  "I want to become a software engineer, what courses should I take?",
  "I'm interested in data science and machine learning",
  "Help me learn web development from scratch",
  "I want to transition into cybersecurity",
  "What courses can help me with digital marketing?"
];

export default function RecommendationsPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationResponse, setRecommendationResponse] = useState<RecommendationResponse | null>(null);
  const router = useRouter();

  // Function to parse and format AI response
  const parseAIResponse = (gptResponse: string) => {
    // Extract JSON courses from the response
    const jsonMatch = gptResponse.match(/\[\s*{[\s\S]*?}\s*\]/);
    let extractedCourses: AISuggestedCourse[] = [];
    
    if (jsonMatch) {
      try {
        extractedCourses = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse courses JSON:', e);
      }
    }

    // Extract meaningful text (remove JSON parts)
    const cleanText = gptResponse
      .replace(/\[\s*{[\s\S]*?}\s*\]/g, '') // Remove JSON blocks
      .replace(/^\s*To become.*?Here are some course recommendations:\s*/i, '') // Remove intro
      .replace(/^\s*[\r\n]+/, '') // Remove leading whitespace
      .replace(/[\r\n]+\s*[\r\n]+/g, '\n\n') // Normalize line breaks
      .trim();

    // Extract key points and format them
    const lines = cleanText.split('\n').filter(line => line.trim());
    const formattedPoints = lines.map(line => line.trim()).filter(line => line);

    return {
      courses: extractedCourses,
      guidance: formattedPoints.join('\n\n')
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendationResponse(null);

    try {
      const response = await recommendationService.getChatRecommendations(query);
      setRecommendationResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const viewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Course Recommendations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your perfect learning path with personalized course recommendations powered by advanced AI
          </p>
        </div>

        {/* Main Search Card */}
        <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              What would you like to learn today?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Tell us about your learning goals, career aspirations, or areas of interest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Textarea
                  id="query"
                  placeholder="e.g., I want to become a full-stack developer and need to learn both frontend and backend technologies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[140px] text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl resize-none"
                  required
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                  {query.length}/500
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || !query.trim()} 
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing your goals...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Get AI Recommendations
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Example Prompts */}
        <Card className="bg-white/60 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
              Need inspiration? Try these examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="p-4 text-left rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start">
                    <Search className="h-4 w-4 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                      {example}
                    </span>
                  </div>
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
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Display */}
        {recommendationResponse?.courses && recommendationResponse.courses.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-green-800">
                        Perfect matches found!
                      </h3>
                      <p className="text-green-700">
                        Found {recommendationResponse.courses.length} courses for: &quot;{recommendationResponse.query}&quot;
                      </p>
                    </div>
                  </div>
                  {recommendationResponse.aiGenerated && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Response */}
            {recommendationResponse.gptResponse && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Bot className="h-5 w-5 mr-2" />
                    AI Learning Path Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const parsed = parseAIResponse(recommendationResponse.gptResponse!);
                      
                      return (
                        <div className="space-y-6">
                          {/* AI-Generated Course Suggestions */}
                          {parsed.courses.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                                <Sparkles className="h-5 w-5 mr-2" />
                                AI-Recommended Learning Path
                              </h4>
                              <div className="grid gap-4">
                                {parsed.courses.map((course: AISuggestedCourse, index: number) => (
                                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                          course.priority === 'high' ? 'bg-red-500' : 
                                          course.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}>
                                          {index + 1}
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <h5 className="text-lg font-semibold text-gray-900">{course.title}</h5>
                                          <Badge className={`${
                                            course.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                            course.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                          }`}>
                                            {course.priority} priority
                                          </Badge>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{course.reason}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Additional Guidance */}
                          {parsed.guidance && (
                            <div className="space-y-3">
                              <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                                <Lightbulb className="h-5 w-5 mr-2" />
                                Learning Guidance & Tips
                              </h4>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  {parsed.guidance}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Cards */}
            <div className="grid gap-6">
              {recommendationResponse.courses.map((course, index) => (
                <Card key={course._id} className="group hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-lg overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Course Info Sidebar */}
                    <div className="lg:w-1/3 bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-white/20 text-white border-white/30">
                            #{index + 1} Recommendation
                          </Badge>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              {Math.round((course.recommendationScore || 0.8) * 100)}% Match
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="bg-white/20 text-white border-white/30 mb-2">
                            {course.category}
                          </Badge>
                          <Badge className="bg-white/20 text-white border-white/30">
                            {course.difficulty}
                          </Badge>
                        </div>

                        {course.rating?.average && (
                          <div className="flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-300 mr-1" />
                            <span className="font-semibold">{course.rating.average.toFixed(1)}</span>
                            <span className="text-white/70 ml-1">({course.rating.count} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="lg:w-2/3 p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mt-2">
                            <User className="h-4 w-4 mr-1" />
                            <span>By {course.instructor?.username || 'Expert Instructor'}</span>
                            {course.enrollmentCount !== undefined && (
                              <>
                                <Clock className="h-4 w-4 ml-4 mr-1" />
                                <span>{course.enrollmentCount} students enrolled</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-gray-700">
                          {course.description}
                        </div>

                        {course.recommendationReason && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <Target className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-amber-800 mb-1">Why this course is perfect for you:</h4>
                                <div className="text-amber-700 text-sm">{course.recommendationReason}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4">
                          <Button 
                            onClick={() => viewCourse(course._id)}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            Explore Course
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Confidence Score</div>
                            <div className="text-2xl font-bold text-green-600">
                              {Math.round((course.recommendationScore || 0.8) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* API Usage Footer */}
            {recommendationResponse.apiUsage && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4">
                  <div className="text-center text-sm text-gray-600">
                    API Usage: {recommendationResponse.apiUsage.totalRequests}/{recommendationResponse.apiUsage.maxRequests} requests
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* How it Works Section */}
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">How AI Recommendations Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">1. Analyze Your Goals</h3>
                <div className="text-gray-600 text-sm">
                  Our AI understands your learning objectives and career aspirations
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">2. Smart Matching</h3>
                <div className="text-gray-600 text-sm">
                  Advanced algorithms match your goals with our course catalog
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">3. Personalized Results</h3>
                <div className="text-gray-600 text-sm">
                  Get tailored recommendations with detailed explanations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
