'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { courseService } from '@/services/courseService'
import { Course } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, Users, DollarSign, BookOpen } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'DevOps',
    'Design',
    'Business',
    'Marketing',
    'Other'
  ]

  const levels = ['Beginner', 'Intermediate', 'Advanced']

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory
      if (selectedLevel) params.level = selectedLevel

      const response = await courseService.getCourses(params)
      setCourses(response.data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedLevel])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || course.category === selectedCategory
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Courses</h1>
        <p className="text-lg text-gray-600">
          Discover and enroll in courses taught by expert instructors
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              title="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              title="Filter by level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge 
                    variant={course.level === 'beginner' ? 'default' : 
                            course.level === 'intermediate' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {course.level}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {course.description}
                </CardDescription>
                <div className="flex items-center text-sm text-gray-600">
                  <span>by {course.instructor.username}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}h
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollmentCount} enrolled
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatCurrency(course.price)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/courses/${course._id}`}>
                      <Button size="sm">
                        View Course
                      </Button>
                    </Link>
                    {/* Role-specific actions */}
                    {user && user.role === 'admin' && (
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
