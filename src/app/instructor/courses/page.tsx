'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, User } from '@/types';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RouteGuard } from '@/components/common/RouteGuard';
import { 
  Plus,
  Edit3,
  Trash2,
  Users,
  DollarSign,
  Clock,
  BookOpen,
  BarChart3,
  Settings,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: number;
  language: string;
  prerequisites: string[];
  learningOutcomes: string[];
  status: 'draft' | 'published';
}

interface EnrolledStudent {
  _id: string;
  student: User;
  enrollmentDate: string;
  progress: {
    percentage: number;
    completedLessons: any[];
  };
  status: string;
}

export default function InstructorCoursesPage() {
  return (
    <RouteGuard requiredRole="instructor">
      <InstructorCoursesContent />
    </RouteGuard>
  );
}

function InstructorCoursesContent() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewingStudents, setViewingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    price: 0,
    duration: 0,
    language: 'English',
    prerequisites: [],
    learningOutcomes: [],
    status: 'draft'
  });

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      // Get courses for the current instructor
      const response = await api.get('/courses', {
        params: { instructor: user?._id }
      });
      
      if (response.data.success) {
        setCourses(response.data.data.courses || response.data.data || []);
      }
    } catch (err: any) {
      setError('Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async (courseId: string) => {
    try {
      setViewingStudents(true);
      const response = await api.get(`/enrollments`, {
        params: { course: courseId }
      });
      
      if (response.data.success) {
        setEnrolledStudents(response.data.data.enrollments || response.data.data || []);
      }
    } catch (err: any) {
      setError('Failed to fetch enrolled students');
      console.error('Error fetching students:', err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const courseData = {
        ...formData,
        instructor: user?._id,
        lessons: [
          {
            title: 'Introduction',
            content: 'Welcome to this course!',
            order: 1,
            duration: 15
          }
        ]
      };

      const response = await api.post('/courses', courseData);
      
      if (response.data.success) {
        setSuccess('Course created successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          price: 0,
          duration: 0,
          language: 'English',
          prerequisites: [],
          learningOutcomes: [],
          status: 'draft'
        });
        fetchInstructorCourses();
        setCreating(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCourse = async (courseId: string, updateData: Partial<Course>) => {
    try {
      const response = await api.put(`/courses/${courseId}`, updateData);
      
      if (response.data.success) {
        setSuccess('Course updated successfully!');
        fetchInstructorCourses();
        setEditing(false);
        setSelectedCourse(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await api.delete(`/courses/${courseId}`);
      
      if (response.data.success) {
        setSuccess('Course deleted successfully!');
        fetchInstructorCourses();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-gray-600">Manage your courses and track student enrollment</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Course Creation Form */}
      {creating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchEnrolledStudents(course._id)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCourse(course);
                      setEditing(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCourse(course._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}h
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Badge className={getDifficultyColor(course.difficulty || 'beginner')}>
                    {course.difficulty || 'beginner'}
                  </Badge>
                  <Badge className={getStatusColor(course.status || 'draft')}>
                    {course.status || 'draft'}
                  </Badge>
                </div>

                <div className="text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolledStudents || 0} students enrolled
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/courses/${course._id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => handleUpdateCourse(course._id, {
                    status: course.status === 'published' ? 'draft' : 'published'
                  })}
                >
                  {course.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first course to start teaching students
            </p>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Students Modal */}
      {viewingStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Enrollment Date</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Progress</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map((enrollment) => (
                        <tr key={enrollment._id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {enrollment.student?.username || 'Unknown'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {enrollment.student?.email || 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {enrollment.progress?.percentage || 0}%
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge className={enrollment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {enrollment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No students enrolled in this course yet.
                </p>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setViewingStudents(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
