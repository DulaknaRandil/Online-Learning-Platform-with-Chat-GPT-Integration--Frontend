'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Sparkles, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface CourseRecommendation {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  price: number;
  instructor: {
    username: string;
    email: string;
  };
  recommendationReason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationResponse {
  prompt: string;
  recommendations: CourseRecommendation[];
  gptResponse?: string;
  totalRecommendations: number;
  matchedCourses: number;
  fallback: boolean;
}

export default function GPTChatComponent() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add user message to chat history
      setChatHistory(prev => [...prev, {
        type: 'user',
        content: prompt,
        timestamp: new Date()
      }]);

      const response = await api.post('/recommendations/gpt-recommendations', {
        prompt: prompt.trim()
      });

      if (response.data.success) {
        setRecommendations(response.data.data);
        
        // Add assistant response to chat history
        setChatHistory(prev => [...prev, {
          type: 'assistant',
          content: response.data.data.gptResponse || 'Here are my course recommendations based on your request.',
          timestamp: new Date()
        }]);
      } else {
        setError(response.data.message || 'Failed to get recommendations');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const examplePrompts = [
    "I want to be a software engineer, what courses should I take?",
    "I'm interested in data science and machine learning",
    "Help me learn web development from scratch",
    "I want to improve my design skills",
    "What courses are good for mobile app development?"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Course Advisor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Ask me about your learning goals and I'll recommend the perfect courses for you!
          </p>
        </CardHeader>
        <CardContent>
          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me about courses... (e.g., 'I want to be a software engineer')"
                className="flex-1"
                maxLength={500}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !prompt.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </form>

          {/* Example Prompts */}
          {chatHistory.length === 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Recommended Courses
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{recommendations.matchedCourses} courses found</span>
              {recommendations.fallback && (
                <Badge variant="outline" className="text-yellow-600">
                  Fallback recommendations
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recommendations.gptResponse && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">{recommendations.gptResponse}</p>
              </div>
            )}

            {recommendations.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.recommendations.map((course) => (
                  <Card key={course._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <Badge className={getPriorityColor(course.priority)}>
                          {course.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Category: {course.category}</span>
                          <span>Level: {course.difficulty}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Instructor: {course.instructor?.username}</span>
                          <span className="font-semibold">
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <strong>Why recommended:</strong> {course.recommendationReason}
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Link href={`/courses/${course._id}`}>
                          <Button size="sm" className="flex-1">
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          Enroll Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specific course recommendations found.</p>
                <p className="text-sm">Try being more specific about your learning goals.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
