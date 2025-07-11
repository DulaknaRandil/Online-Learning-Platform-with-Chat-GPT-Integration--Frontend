'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateCourse() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure user is an instructor
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (user.role !== 'instructor') {
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    tags: [] as string[],
    prerequisites: [] as string[],
    learningOutcomes: [] as string[],
    lessons: [] as Array<{
      title: string;
      content: string;
      duration: string;
      videoUrl?: string;
    }>
  });

  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearningOutcome, setNewLearningOutcome] = useState('');
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    duration: '',
    videoUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.prerequisites.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((req: string) => req !== requirementToRemove)
    }));
  };

  const addLearningOutcome = () => {
    if (newLearningOutcome.trim() && !formData.learningOutcomes.includes(newLearningOutcome.trim())) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, newLearningOutcome.trim()]
      }));
      setNewLearningOutcome('');
    }
  };

  const removeLearningOutcome = (outcomeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((outcome: string) => outcome !== outcomeToRemove)
    }));
  };

  const addLesson = () => {
    if (newLesson.title.trim() && newLesson.content.trim()) {
      setFormData(prev => ({
        ...prev,
        lessons: [...prev.lessons, { ...newLesson }]
      }));
      setNewLesson({
        title: '',
        content: '',
        duration: '',
        videoUrl: ''
      });
    }
  };

  const removeLesson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        setError('Title, description, and category are required fields.');
        setLoading(false);
        return;
      }

      // Prepare the data with proper type handling for all required fields
      const courseData = {
        title: String(formData.title || '').trim() || 'Untitled Course',
        description: String(formData.description || '').trim() || 'No description provided',
        category: String(formData.category || '').trim() || 'General',
        difficulty: formData.difficulty || 'beginner',
        // Ensure price and duration are always valid numbers
        price: parseFloat(String(formData.price || '0')),
        duration: parseInt(String(formData.duration || '0')),
        // Ensure arrays are always arrays
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        prerequisites: Array.isArray(formData.prerequisites) ? formData.prerequisites : [],
        learningOutcomes: Array.isArray(formData.learningOutcomes) ? formData.learningOutcomes : [],
        // Add the required fields that might be missing
        language: 'English',
        status: 'draft' as const,
        // Map to new field names too (for backend compatibility)
        requirements: Array.isArray(formData.prerequisites) ? formData.prerequisites : [],
        objectives: Array.isArray(formData.learningOutcomes) ? formData.learningOutcomes : []
      };

      // Fix any NaN values
      if (isNaN(courseData.price)) courseData.price = 0;
      if (isNaN(courseData.duration)) courseData.duration = 0;

      console.log("Submitting course with data:", courseData);
      
      // Create the course
      const result = await courseService.createCourse(courseData);
      console.log("Course creation successful:", result);
      
      // Wait a moment before redirecting (to ensure data is saved)
      setTimeout(() => {
        router.push('/instructor/dashboard');
      }, 500);
    } catch (err: unknown) {
      console.error("Course creation error:", err);
      let errorMessage = 'Failed to create course. Please try again.';
      
      // Try to extract a more specific error message
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        const error = err as { 
          response?: { 
            data?: { 
              message?: string; 
              error?: string;
              errors?: Array<{ message: string }> 
            } 
          } 
        };
        
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          // If there are validation errors, display them
          errorMessage = error.response.data.errors.map(e => e.message).join(', ');
        } else {
          // Otherwise use any available error message
          errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create your course</p>
        </div>
        <Link href="/instructor/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Course Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your course"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="99.99"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                <Input
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="40"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Course difficulty"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Web Development, Data Science"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove tag: ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.prerequisites.map((requirement: string, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span>{requirement}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(requirement)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove requirement: ${requirement}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>What You Will Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newLearningOutcome}
                onChange={(e) => setNewLearningOutcome(e.target.value)}
                placeholder="Add a learning outcome"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningOutcome())}
              />
              <Button type="button" onClick={addLearningOutcome}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.learningOutcomes.map((outcome: string, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span>{outcome}</span>
                  <button
                    type="button"
                    onClick={() => removeLearningOutcome(outcome)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove learning outcome: ${outcome}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lesson Title</label>
                <Input
                  value={newLesson.title}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={newLesson.content}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter lesson content"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <Input
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                    type="number"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL (optional)</label>
                  <Input
                    value={newLesson.videoUrl}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button type="button" onClick={addLesson}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>

            <div className="space-y-3">
              {formData.lessons.map((lesson, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">{lesson.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {lesson.duration} minutes
                        {lesson.videoUrl && ' • Video included'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Remove lesson: ${lesson.title}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Link href="/instructor/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
