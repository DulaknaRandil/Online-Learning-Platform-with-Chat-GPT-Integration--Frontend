'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';

export interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  category: string;
  difficulty: string;
  duration: string;
  language: string;
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  thumbnail?: string;
  videoUrl?: string;
  materials?: string[];
}

export interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'DevOps',
  'Cybersecurity',
  'Cloud Computing',
  'Database',
  'Design',
  'Marketing',
  'Business',
  'Other'
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Other'];

const defaultFormData: CourseFormData = {
  title: '',
  description: '',
  shortDescription: '',
  price: 0,
  category: '',
  difficulty: '',
  duration: '',
  language: 'English',
  prerequisites: [],
  objectives: [],
  tags: [],
  thumbnail: '',
  videoUrl: '',
  materials: []
};

export default function CourseForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  mode = 'create' 
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>(() => ({
    ...defaultFormData,
    ...initialData
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof CourseFormData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.shortDescription) newErrors.shortDescription = 'Short description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    if (formData.objectives.length === 0) newErrors.objectives = 'At least one learning objective is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      handleInputChange('prerequisites', [...formData.prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    handleInputChange('prerequisites', formData.prerequisites.filter((_, i) => i !== index));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      handleInputChange('objectives', [...formData.objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    handleInputChange('objectives', formData.objectives.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleInputChange('tags', formData.tags.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Course' : 'Edit Course'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Course Title</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter course title"
                className={errors.title ? 'border-red-500' : ''}
                required
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (hours)</label>
              <Input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 10 hours"
                className={errors.duration ? 'border-red-500' : ''}
                required
              />
              {errors.duration && (
                <p className="text-red-600 text-sm mt-1">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Course Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the course"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
              required
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <Textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief summary of the course"
              rows={2}
              className={errors.shortDescription ? 'border-red-500' : ''}
              required
            />
            {errors.shortDescription && (
              <p className="text-red-600 text-sm mt-1">{errors.shortDescription}</p>
            )}
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select difficulty</option>
                {DIFFICULTY_LEVELS.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              {errors.difficulty && (
                <p className="text-red-600 text-sm mt-1">{errors.difficulty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
                required
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-2">Language</label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail URL (optional)</label>
            <Input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => handleInputChange('thumbnail', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium mb-2">Prerequisites</label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                placeholder="Add a prerequisite"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              />
              <Button type="button" onClick={addPrerequisite} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prerequisite, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {prerequisite}
                  <button
                    type="button"
                    onClick={() => removePrerequisite(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                    aria-label={`Remove prerequisite: ${prerequisite}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium mb-2">Learning Objectives</label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Add a learning objective"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
              />
              <Button type="button" onClick={addObjective} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove objective: ${objective}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.objectives && (
              <p className="text-red-600 text-sm mt-1">{errors.objectives}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                    aria-label={`Remove tag: ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Course' : 'Update Course'
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
