'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { enrollmentService } from '@/services/enrollmentService'
import { Enrollment } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, Sparkles, MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (user.role !== 'student') {
      // Redirect based on user role
      if (user.role === 'instructor') {
        router.push('/instructor/dashboard')
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
      return
    }

    fetchEnrollments()
  }, [user, router])

  const fetchEnrollments = async () => {
    try {
      console.log('Fetching enrollments for student dashboard');
      const data = await enrollmentService.getMyEnrollments();
      console.log('Enrollments data received:', data);
      
      // Filter out any invalid enrollments that might cause errors
      const validEnrollments = Array.isArray(data) ? data.filter(enrollment => 
        enrollment && 
        enrollment._id && 
        enrollment.course && 
        enrollment.course.title
      ) : [];
      
      console.log('Valid enrollments:', validEnrollments);
      setEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'enrolled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completedCourses = enrollments.filter(e => e.status === 'completed')
  const inProgressCourses = enrollments.filter(e => e.status === 'in-progress')
  const totalHours = enrollments.reduce((sum, e) => sum + e.course.duration, 0)
  const averageProgress = enrollments.length > 0 
    ? enrollments.reduce((sum, e) => sum + e.progress.percentage, 0) / enrollments.length 
    : 0

  if (!user || user.role !== 'student') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.username ? user.username.split(' ')[0] : user.email.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Track your learning progress and continue your courses</p>
        </div>
        <Link href="/courses">
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              {enrollments.length === 1 ? 'course' : 'courses'} enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedCourses.length === 1 ? 'course' : 'courses'} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressCourses.length === 1 ? 'course' : 'courses'} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">
              total hours of content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Course Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized course recommendations based on your learning goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Tell our AI what you want to learn and get instant course recommendations
              </p>
              <p className="text-xs text-purple-600">
                ✨ Powered by advanced AI technology
              </p>
            </div>
            <Link href="/student/recommendations">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Recommendations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            Your average progress across all enrolled courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Completion</span>
              <span>{Math.round(averageProgress)}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                      <CardDescription>
                        by {enrollment.course.instructor.username || enrollment.course.instructor.email}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Enrolled: {formatDate(enrollment.enrollmentDate)}</span>
                    <span>{enrollment.course.duration} hours</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{enrollment.progress.percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress.percentage} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {enrollment.progress.completedLessons.length} of {enrollment.course.lessons.length} lessons completed
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/courses/${enrollment.course._id}`}>
                        <Button variant="outline" size="sm">
                          View Course
                        </Button>
                      </Link>
                      <Button size="sm">
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* GPT Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>GPT Recommendations</CardTitle>
          <CardDescription>
            Courses recommended for you based on your interests and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Course Title 1</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Course Title 2</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Course Title 3</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
