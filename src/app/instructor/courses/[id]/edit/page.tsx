'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { courseService } from '@/services/courseService'
import { Course } from '@/types'
import Link from 'next/link'

export default function EditCoursePage() {
  const router = useRouter()
  const { id } = useParams()
  const courseId = Array.isArray(id) ? id[0] : id

  const [course, setCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return
      
      try {
        setLoading(true)
        const courseData = await courseService.getCourse(courseId)
        setCourse(courseData)
        
        // Set form data from course
        setFormData({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          price: courseData.price,
          difficulty: courseData.difficulty
        })
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId) return;
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Prepare a clean object with proper types for each field
      const cleanData = {
        title: String(formData.title || ''),
        description: String(formData.description || ''),
        category: String(formData.category || ''),
        difficulty: String(formData.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        price: typeof formData.price === 'number' ? formData.price : 
               parseFloat(String(formData.price)) || 0
      };
      
      console.log('Submitting course update with clean data:', cleanData);
      
      // Use our improved update method that tries multiple endpoints
      await courseService.updateCourse(courseId, cleanData);
      
      setSuccess('Course updated successfully!')
      
      // Redirect back to instructor dashboard after short delay
      setTimeout(() => {
        router.push('/instructor/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Error updating course:', err)
      setError('Failed to update course. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="pt-6">
          <p className="text-red-500">
            Course not found or you don&apos;t have permission to edit it.
          </p>
          <Button asChild className="mt-4">
            <Link href="/instructor/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Course</CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-500 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 mb-6 bg-green-50 text-green-500 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">Course Title</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[150px] w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium">Category</label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium">Price</label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="difficulty" className="block text-sm font-medium">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Updating...' : 'Update Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}