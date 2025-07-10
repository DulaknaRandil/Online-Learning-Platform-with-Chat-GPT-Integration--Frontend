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
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle,
  Play,
  Download,
  DollarSign,
  Award,
  Target,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
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

  const checkEnrollment = useCallback(async () => {
    if (!user || !id) return;
    
    try {
      const enrollments = await enrollmentService.getMyEnrollments();
      const existingEnrollment = enrollments.find(
        (enrollment: Enrollment) => enrollment.course._id === id
      );
      setEnrollment(existingEnrollment || null);
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  }, [user, id]);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [id, user, fetchCourse, checkEnrollment]);

  const handleEnroll = async () => {
    if (!user || !course) {
      router.push('/auth/login');
      return;
    }

    setEnrolling(true);
    setError(null);

    try {
      await enrollmentService.enroll(course._id);
      await checkEnrollment();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const getProgressPercentage = () => {
    if (!enrollment || !course) return 0;
    return enrollment.progress.percentage || 0;
  };

  const isEnrolled = () => {
    return enrollment && enrollment.status !== 'dropped';
  };

  const canAccess = () => {
    return user && (
      isEnrolled() || 
      course?.instructor._id === user._id ||
      user.role === 'admin'
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Course not found'}
          </h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/courses">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
        
        {user && (
          <div className="flex gap-2">
            {/* Instructor actions */}
            {course.instructor._id === user._id && (
              <>
                <Link href={`/instructor/courses/edit/${course._id}`}>
                  <Button variant="outline">Edit Course</Button>
                </Link>
                <Button 
                  variant={course.isPublished ? "secondary" : "default"}
                  onClick={() => courseService.togglePublish(course._id)}
                >
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
              </>
            )}
            
            {/* Admin actions */}
            {user.role === 'admin' && course.instructor._id !== user._id && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => alert('Admin edit functionality will be implemented here')}
                >
                  Admin Edit
                </Button>
                {!course.isPublished && (
                  <Button 
                    variant="secondary"
                    onClick={() => courseService.togglePublish(course._id)}
                  >
                    Force Publish
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {course.isPublished && <Badge variant="default">Published</Badge>}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrolledStudents} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{course.rating.average.toFixed(1)} ({course.rating.count} reviews)</span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{course.description}</p>
          </div>

          {/* Instructor Info */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {course.instructor.username[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {course.instructor.username}
                  </h3>
                  <p className="text-gray-600">{course.instructor.bio || 'Experienced educator'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You'll Learn */}
          {course.learningOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What You&apos;ll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              {course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.duration} minutes</p>
                        </div>
                      </div>
                      {canAccess() && (
                        <div className="flex items-center gap-2">
                          {lesson.videoUrl && (
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {lesson.resources.length > 0 && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No lessons available yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {course.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${course.price}
                </div>
                <p className="text-gray-600">One-time payment</p>
              </div>

              {isEnrolled() ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Enrolled</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      You have access to this course
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{getProgressPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>

                  <Link href={`/courses/${course._id}/learn`}>
                    <Button className="w-full">
                      {getProgressPercentage() === 0 ? 'Start Learning' : 'Continue Learning'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <Button 
                      className="w-full" 
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  ) : (
                    <Link href="/auth/login">
                      <Button className="w-full">
                        Login to Enroll
                      </Button>
                    </Link>
                  )}
                  
                  <div className="text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Students</span>
                <span className="font-medium">{course.enrolledStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lessons</span>
                <span className="font-medium">{course.lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{course.duration} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level</span>
                <span className="font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium">{course.rating.average.toFixed(1)}/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
