'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, BookOpen, Users, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructorCourses = useCallback(async () => {
    try {
      setLoading(true);
      if (!user || !user._id) {
        console.error('User or user ID is undefined');
        return;
      }
      
      // Use the proper endpoint for instructor courses
      console.log('Fetching courses for instructor ID:', user._id);
      const response = await courseService.getInstructorCourses(user._id);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setCourses(response);
      } else if (response && Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Handle nested data structure
        const data = (response as { data: unknown }).data;
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && typeof data === 'object' && 'courses' in data && Array.isArray((data as { courses: unknown[] }).courses)) {
          setCourses((data as { courses: Course[] }).courses);
        } else {
          console.error('Unexpected data format inside response:', data);
          setCourses([]);
        }
      } else {
        console.error('Unexpected response format:', response);
        setCourses([]);
      }
    } catch (err) {
      setError('Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Check if user is logged in and is an instructor
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    if (user.role !== 'instructor') {
      // Redirect based on user role
      if (user.role === 'student') {
        window.location.href = '/student/dashboard';
      } else if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
      return;
    }
    
    fetchInstructorCourses();
  }, [fetchInstructorCourses, user]);

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      setLoading(true);
      console.log('Attempting to delete course ID:', courseId);
      
      let success = false;
      
      // Try direct delete method first (most reliable)
      try {
        await courseService.directDeleteCourse(courseId);
        success = true;
        console.log('Direct delete succeeded');
      } catch (directErr) {
        console.error('Direct delete failed, trying emergency method:', directErr);
        
        try {
          await courseService.emergencyDeleteCourse(courseId);
          success = true;
          console.log('Emergency delete succeeded');
        } catch (emergencyErr) {
          console.error('Emergency delete failed, trying standard method:', emergencyErr);
          
          try {
            await courseService.deleteCourse(courseId);
            success = true;
            console.log('Standard delete succeeded');
          } catch (standardErr) {
            console.error('Standard delete failed:', standardErr);
            throw standardErr; // Re-throw to be caught by outer catch
          }
        }
      }
      
      if (success) {
        // Update local state to remove the deleted course
        setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
        
        // Show success message
        setError(null);
        window.alert('Course deleted successfully');
        
        // Refresh the course list to ensure we have the latest data
        fetchInstructorCourses();
      }
    } catch (err) {
      console.error('All delete methods failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setError(errorMessage);
      // Show error in alert for immediate feedback
      window.alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string, status: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to toggle publish status for course ${courseId} (current status: ${status})`);
      
      let success = false;
      let updatedCourse: { status?: string } | null = null;
      
      // Try direct method first (most reliable)
      try {
        const directResponse = await courseService.directTogglePublish(courseId);
        success = true;
        console.log('Direct toggle publish succeeded');
        
        if (directResponse && typeof directResponse === 'object' && 'data' in directResponse) {
          const data = (directResponse as { data: unknown }).data;
          if (data && typeof data === 'object' && 'status' in data) {
            updatedCourse = data as { status?: string };
          }
        } else {
          // Since we might not have complete course details, manually toggle the status
          updatedCourse = { status: status === 'published' ? 'draft' : 'published' };
        }
      } catch (directErr) {
        console.error('Direct toggle publish failed, trying emergency method:', directErr);
        
        try {
          await courseService.emergencyTogglePublish(courseId);
          success = true;
          console.log('Emergency toggle publish succeeded');
          // Since emergency doesn't return course details, we'll manually toggle the status
          updatedCourse = { status: status === 'published' ? 'draft' : 'published' };
        } catch (emergencyErr) {
          console.error('Emergency toggle publish failed, trying standard method:', emergencyErr);
          
          // Fallback to standard method
          try {
            updatedCourse = await courseService.togglePublish(courseId);
            success = true;
            console.log('Standard toggle publish succeeded');
          } catch (standardErr) {
            console.error('Standard toggle publish failed:', standardErr);
            throw standardErr; // Re-throw to be caught by outer catch
          }
        }
      }
      
      if (success) {
        // Refresh course list to ensure we have the latest data
        fetchInstructorCourses();
        
        // Also update the UI immediately for better responsiveness
        setCourses(prevCourses => prevCourses.map(course => {
          if (course._id === courseId) {
            // Determine the new status as a valid enum value
            const newStatus: 'draft' | 'published' | 'archived' = 
              (updatedCourse?.status === 'draft' || 
               updatedCourse?.status === 'published' || 
               updatedCourse?.status === 'archived') ? 
                updatedCourse.status : 
                (status === 'published' ? 'draft' : 'published');
            
            return { 
              ...course,
              status: newStatus
            };
          }
          return course;
        }));
        
        // Log the new status for debugging
        const newStatus = updatedCourse?.status || (status === 'published' ? 'draft' : 'published');
        console.log(`Course ${courseId} status changed to: ${newStatus}`);
        
        setError(null);
        window.alert(`Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        
        // Refresh the course list to ensure we have the latest data
        await fetchInstructorCourses();
      }
    } catch (err) {
      console.error('All toggle publish methods failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course status';
      setError(errorMessage);
      window.alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Ensure we handle undefined/NaN values properly
  const totalStudents = courses.reduce((sum, course) => {
    const students = course.enrolledStudents || 0;
    return sum + students;
  }, 0);
  
  const publishedCourses = courses.filter(course => course.status === 'published').length;
  
  const totalRevenue = courses.reduce((sum, course) => {
    const price = typeof course.price === 'number' ? course.price : 0;
    const students = typeof course.enrolledStudents === 'number' ? course.enrolledStudents : 0;
    return sum + (price * students);
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.username ? user.username.split(' ')[0] : user?.email.split('@')[0]}!</p>
        </div>
        <Link href="/instructor/courses/create">
          <Button className="flex items-center gap-2">
            <Plus size={20} />
            Create New Course
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${typeof totalRevenue === 'number' && !isNaN(totalRevenue) ? totalRevenue.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">
                Start creating your first course to share knowledge with students.
              </p>
              <Link href="/instructor/courses/create">
                <Button>Create Your First Course</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <Badge variant={course.status === 'published' ? "default" : "secondary"}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {typeof course.enrolledStudents === 'number' ? course.enrolledStudents : 0} students
                        </span>
                        <span>${course.price}</span>
                        <span>Level: {course.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          console.log('Viewing course:', course._id);
                          try {
                            // First verify the course is accessible with our emergency method
                            await courseService.emergencyViewCourse(course._id);
                            
                            // Try to navigate to the course detail page
                            window.open(`/courses/${course._id}`, '_blank');
                          } catch (err) {
                            console.error('View course error:', err);
                            
                            // Fallback - show alert with course details if there's any issue
                            window.alert(`Course Details:\n\nTitle: ${course.title}\nStatus: ${course.status}\nPrice: $${course.price}\nDifficulty: ${course.difficulty}`);
                          }
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Link href={`/instructor/courses/${course._id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(course._id, course.status)}
                      >
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
