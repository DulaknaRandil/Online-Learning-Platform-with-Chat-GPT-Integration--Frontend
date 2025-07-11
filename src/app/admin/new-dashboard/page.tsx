'use client';

import { useState, useEffect } from 'react';
import { User, Course, Enrollment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RouteGuard } from '@/components/common/RouteGuard';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  BarChart3,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers: number;
  revenue: number;
}

export default function AdminDashboardNew() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminDashboardContent />
    </RouteGuard>
  );
}

function AdminDashboardContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeUsers: 0,
    revenue: 0
  });
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'enrollments'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(u => 
      u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, userSearchTerm]);

  useEffect(() => {
    // Filter courses based on search term
    const filtered = courses.filter(c => 
      c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(courseSearchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, courseSearchTerm]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [usersResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
        api.get('/admin/users').catch(() => api.get('/test/users')),
        api.get('/courses'),
        api.get('/enrollments')
      ]);

      // Process users
      let usersData = [];
      if (usersResponse.data.success) {
        usersData = usersResponse.data.data.users || usersResponse.data.data || [];
      }
      setUsers(usersData);

      // Process courses
      let coursesData = [];
      if (coursesResponse.data.success) {
        coursesData = coursesResponse.data.data.courses || coursesResponse.data.data || [];
      }
      setCourses(coursesData);

      // Process enrollments
      let enrollmentsData = [];
      if (enrollmentsResponse.data.success) {
        enrollmentsData = enrollmentsResponse.data.data.enrollments || enrollmentsResponse.data.data || [];
      }
      setEnrollments(enrollmentsData);

      // Calculate stats
      const activeUsers = usersData.filter((u: User) => u.isActive).length;
      const totalRevenue = enrollmentsData.reduce((sum: number, enrollment: Enrollment) => {
        const course = coursesData.find((c: Course) => c._id === enrollment.course._id);
        return sum + (course?.price || 0);
      }, 0);

      setStats({
        totalUsers: usersData.length,
        totalCourses: coursesData.length,
        totalEnrollments: enrollmentsData.length,
        activeUsers,
        revenue: totalRevenue
      });

    } catch (err: unknown) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete' && !confirm('Are you sure you want to delete this user?')) {
        return;
      }

      let response;
      switch (action) {
        case 'activate':
        case 'deactivate':
          response = await api.put(`/admin/users/${userId}`, { 
            isActive: action === 'activate' 
          });
          break;
        case 'delete':
          response = await api.delete(`/admin/users/${userId}`);
          break;
      }

      if (response?.data.success) {
        setSuccess(`User ${action}d successfully`);
        fetchAllData();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to ${action} user`;
      setError(errorMessage);
    }
  };

  const handleCourseAction = async (courseId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete' && !confirm('Are you sure you want to delete this course?')) {
        return;
      }

      let response;
      switch (action) {
        case 'approve':
          response = await api.put(`/courses/${courseId}`, { status: 'published' });
          break;
        case 'reject':
          response = await api.put(`/courses/${courseId}`, { status: 'draft' });
          break;
        case 'delete':
          response = await api.delete(`/courses/${courseId}`);
          break;
      }

      if (response?.data.success) {
        setSuccess(`Course ${action}d successfully`);
        fetchAllData();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to ${action} course`;
      setError(errorMessage);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, courses, and platform analytics</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              courses available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              total enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEnrollments > 0 ? (stats.revenue / stats.totalEnrollments).toFixed(0) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              avg. revenue per enrollment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'users', 'courses', 'enrollments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'overview' | 'users' | 'courses' | 'enrollments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div key={course._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500">{course.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${course.price}</p>
                      <p className="text-sm text-gray-500">{course.enrollmentCount || 0} enrolled</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">User</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Joined</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user._id, 'delete')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'courses' && (
        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Course</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Instructor</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Enrollments</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {typeof course.instructor === 'object' 
                          ? course.instructor?.username || 'Unknown'
                          : 'Unknown'
                        }
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{course.category}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {course.enrollmentCount || 0}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge className={course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCourseAction(course._id, course.status === 'published' ? 'reject' : 'approve')}
                          >
                            {course.status === 'published' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCourseAction(course._id, 'delete')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'enrollments' && (
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Course</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Enrollment Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Progress</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.slice(0, 20).map((enrollment) => (
                    <tr key={enrollment._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {typeof enrollment.student === 'object' 
                          ? enrollment.student?.username || 'Unknown'
                          : 'Unknown'
                        }
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {typeof enrollment.course === 'object' 
                          ? enrollment.course?.title || 'Unknown'
                          : 'Unknown'
                        }
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
