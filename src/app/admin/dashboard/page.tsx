'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Course } from '@/types';
import { courseService } from '@/services/courseService';
import { adminService, AdminDashboardStats } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Search,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses'>('overview');
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('AdminDashboard: Starting to fetch data...');
      
      // Get all courses using the admin service
      console.log('AdminDashboard: Fetching courses...');
      const coursesData = await adminService.getAllCourses();
      console.log('AdminDashboard: Courses received:', coursesData);
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      
      // Get all users using the admin service
      console.log('AdminDashboard: Fetching users...');
      const usersData = await adminService.getAllUsers();
      console.log('AdminDashboard: Users received:', usersData);
      setUsers(usersData);
      setFilteredUsers(usersData);
      
      // Get dashboard statistics
      try {
        console.log('AdminDashboard: Fetching dashboard stats...');
        const dashboardStats = await adminService.getDashboardStats();
        if (dashboardStats) {
          setStats(dashboardStats);
          console.log('Admin dashboard stats:', dashboardStats);
        }
      } catch (statsError) {
        console.error('Failed to fetch dashboard stats:', statsError);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Ensure user is logged in and is an admin
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    
    if (user.role !== 'admin') {
      // Redirect based on user role
      if (user.role === 'student') {
        window.location.href = '/student/dashboard';
      } else if (user.role === 'instructor') {
        window.location.href = '/instructor/dashboard';
      } else {
        window.location.href = '/';
      }
      return;
    }
    
    fetchData();
  }, [fetchData, user]);

  useEffect(() => {
    // Make sure users array exists before filtering
    if (users && Array.isArray(users)) {
      const filtered = users.filter(user =>
        (user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) || '') ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, userSearchTerm]);

  useEffect(() => {
    // Make sure courses array exists before filtering
    if (courses && Array.isArray(courses)) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(courseSearchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courses, courseSearchTerm]);

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    const operationId = `user-toggle-${userId}`;
    setOperationLoading(operationId);
    
    try {
      // Call the admin service to toggle user status
      await adminService.toggleUserStatus(userId);
      
      // Update local state
      if (users && Array.isArray(users)) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isActive: !isActive } : user
        ));
      }
      
      toast.success(
        'User status updated',
        `User has been ${!isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast.error(
        'Failed to update user status',
        'Please try again later'
      );
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Use a more user-friendly confirmation
    const userToDelete = users.find(u => u._id === userId);
    const userName = userToDelete?.username || userToDelete?.email || 'this user';
    
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;
    
    const operationId = `user-delete-${userId}`;
    setOperationLoading(operationId);
    
    try {
      // Call the admin service to delete the user
      await adminService.deleteUser(userId);
      
      // Update local state
      if (users && Array.isArray(users)) {
        setUsers(users.filter(user => user._id !== userId));
      }
      
      toast.success(
        'User deleted',
        `${userName} has been deleted successfully`
      );
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(
        'Failed to delete user',
        'Please try again later'
      );
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const courseToDelete = courses.find(c => c._id === courseId);
    const courseName = courseToDelete?.title || 'this course';
    
    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) return;
    
    const operationId = `course-delete-${courseId}`;
    setOperationLoading(operationId);
    
    try {
      await adminService.deleteCourse(courseId);
      if (courses && Array.isArray(courses)) {
        setCourses(courses.filter(course => course._id !== courseId));
      }
      
      toast.success(
        'Course deleted',
        `"${courseName}" has been deleted successfully`
      );
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error(
        'Failed to delete course',
        'Please try again later'
      );
    } finally {
      setOperationLoading(null);
    }
  };

  const handleToggleCourseStatus = async (courseId: string) => {
    const operationId = `course-toggle-${courseId}`;
    setOperationLoading(operationId);
    
    try {
      const course = courses.find(c => c._id === courseId);
      const currentStatus = course?.status;
      
      // Use the new toggleCourseStatus method instead of togglePublish
      await courseService.toggleCourseStatus(courseId);
      
      if (courses && Array.isArray(courses)) {
        setCourses(courses.map(course => 
          course._id === courseId ? { 
            ...course, 
            status: course.status === 'published' ? 'draft' : 'published' 
          } : course
        ));
      }
      
      const newStatus = currentStatus === 'published' ? 'unpublished' : 'published';
      toast.success(
        'Course status updated',
        `Course has been ${newStatus} successfully`
      );
    } catch (err) {
      console.error('Error toggling course status:', err);
      toast.error(
        'Failed to update course status',
        'Please try again later'
      );
    } finally {
      setOperationLoading(null);
    }
  };

  // Calculate stats from local data if the backend stats are not available
  const calculateLocalStats = () => {
    // Ensure users and courses are arrays before attempting to filter
    const usersArray = Array.isArray(users) ? users : [];
    const coursesArray = Array.isArray(courses) ? courses : [];
    
    const totalUsers = usersArray.length;
    const activeUsers = usersArray.filter(user => user.isActive)?.length || 0;
    const totalCourses = coursesArray.length;
    const publishedCourses = coursesArray.filter(course => course.status === 'published')?.length || 0;
    const totalStudents = usersArray.filter(user => user.role === 'student')?.length || 0;
    const totalInstructors = usersArray.filter(user => user.role === 'instructor')?.length || 0;

    return {
      users: {
        totalUsers,
        activeUsers: activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        studentCount: totalStudents,
        instructorCount: totalInstructors,
        adminCount: usersArray.filter(user => user.role === 'admin')?.length || 0,
        recentRegistrations: 0
      },
      courses: {
        totalCourses,
        publishedCourses,
        draftCourses: coursesArray.filter(course => course.status === 'draft')?.length || 0,
        archivedCourses: 0,
        categories: [],
        popularCourses: [],
        recentCourses: 0
      },
      enrollments: {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        droppedEnrollments: 0,
        recentEnrollments: 0,
        enrollmentTrend: [],
        paymentMethods: []
      }
    };
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use backend stats if available, otherwise calculate from local data
  const displayStats = stats || calculateLocalStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, courses, and platform settings</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Users ({Array.isArray(users) ? users.length : 0})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Courses ({Array.isArray(courses) ? courses.length : 0})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats?.users?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats?.users?.activeUsers || 0}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats?.courses?.totalCourses || 0}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats?.courses?.publishedCourses || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats?.users?.studentCount || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Instructors</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats?.users?.instructorCount || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(users) ? users.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.username || user.email}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'instructor' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500 py-4">No users found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(courses) ? courses.slice(0, 5).map((course) => (
                    <div key={course._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.category}</p>
                      </div>
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                        {course.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500 py-4">No courses found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">User</th>
                      <th className="text-left p-4 font-medium text-gray-900">Role</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Joined</th>
                      <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(filteredUsers) ? filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="font-medium">
                                {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.username || user.email}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'instructor' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              disabled={operationLoading === `user-toggle-${user._id}`}
                            >
                              {operationLoading === `user-toggle-${user._id}` ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={operationLoading === `user-delete-${user._id}`}
                            >
                              {operationLoading === `user-delete-${user._id}` ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">Course</th>
                      <th className="text-left p-4 font-medium text-gray-900">Instructor</th>
                      <th className="text-left p-4 font-medium text-gray-900">Category</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Students</th>
                      <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(filteredCourses) ? filteredCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500">${course.price}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-sm">
                              {course.instructor.username || course.instructor.email}
                            </p>
                            <p className="text-xs text-gray-500">{course.instructor.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{course.category}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {course.enrolledStudents}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/courses/${course._id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleCourseStatus(course._id)}
                              disabled={operationLoading === `course-toggle-${course._id}`}
                            >
                              {operationLoading === `course-toggle-${course._id}` ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                course.status === 'published' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCourse(course._id)}
                              disabled={operationLoading === `course-delete-${course._id}`}
                            >
                              {operationLoading === `course-delete-${course._id}` ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No courses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
