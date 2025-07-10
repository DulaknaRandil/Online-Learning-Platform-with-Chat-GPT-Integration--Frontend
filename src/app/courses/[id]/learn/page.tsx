'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Enrollment } from '@/types';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle,
  PlayCircle,
  Download,
  FileText,
  Clock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function LearnCourse() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse(id as string);
      setCourse(courseData);
    } catch (err) {
      setError('Failed to fetch course details');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEnrollment = useCallback(async () => {
    if (!user || !id) return;
    
    try {
      const enrollments = await enrollmentService.getMyEnrollments();
      const existingEnrollment = enrollments.find(
        (enrollment: Enrollment) => enrollment.course._id === id
      );
      
      if (!existingEnrollment) {
        router.push(`/courses/${id}`);
        return;
      }
      
      setEnrollment(existingEnrollment);
    } catch (err) {
      setError('Failed to fetch enrollment details');
      console.error('Error fetching enrollment:', err);
    }
  }, [user, id, router]);

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchEnrollment();
    }
  }, [id, fetchCourse, fetchEnrollment]);

  const isLessonCompleted = (lessonId: string) => {
    if (!enrollment) return false;
    return enrollment.progress.completedLessons.some(
      (completed) => completed.lessonId === lessonId
    );
  };

  const markLessonAsCompleted = async (lessonId: string) => {
    if (!enrollment || isLessonCompleted(lessonId)) return;
    
    try {
      // This would typically be an API call to mark lesson as completed
      // For now, we&apos;ll just update the local state
      const updatedEnrollment = {
        ...enrollment,
        progress: {
          ...enrollment.progress,
          completedLessons: [
            ...enrollment.progress.completedLessons,
            { lessonId, completedAt: new Date() }
          ]
        }
      };
      
      // Calculate new percentage
      const totalLessons = course?.lessons.length || 0;
      const completedCount = updatedEnrollment.progress.completedLessons.length;
      updatedEnrollment.progress.percentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
      
      setEnrollment(updatedEnrollment);
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
    }
  };

  const goToNextLesson = () => {
    if (course && currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const getProgressPercentage = () => {
    if (!enrollment || !course) return 0;
    return enrollment.progress.percentage || 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course || !enrollment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Course not found or access denied'}
          </h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${course._id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">
              Lesson {currentLessonIndex + 1} of {course.lessons.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Progress: {getProgressPercentage().toFixed(0)}%
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Lesson List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson._id}
                    onClick={() => setCurrentLessonIndex(index)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 flex items-center justify-between ${
                      index === currentLessonIndex ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isLessonCompleted(lesson._id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} min
                        </p>
                      </div>
                    </div>
                    {index === currentLessonIndex && (
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lesson Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentLesson.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Duration: {currentLesson.duration} minutes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isLessonCompleted(currentLesson._id) ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => markLessonAsCompleted(currentLesson._id)}
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Video Player */}
              {currentLesson.videoUrl && (
                <div className="mb-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Video Player</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentLesson.videoUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {currentLesson.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          {currentLesson.resources && currentLesson.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentLesson.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {resource.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                      {resource.type === 'video' && <PlayCircle className="h-5 w-5 text-blue-500" />}
                      {resource.type === 'article' && <FileText className="h-5 w-5 text-green-500" />}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{resource.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevLesson}
                  disabled={currentLessonIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {currentLessonIndex + 1} of {course.lessons.length}
                  </span>
                </div>

                <Button
                  onClick={goToNextLesson}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
