import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressTrackerProps {
  progress: {
    completedLessons: Array<{
      lessonId: string;
      completedAt: Date;
    }>;
    percentage: number;
  };
  lessons: Array<{
    _id: string;
    title: string;
    duration: number;
  }>;
  courseTitle: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  lessons,
  courseTitle
}) => {
  const isLessonCompleted = (lessonId: string) => {
    return progress.completedLessons.some(
      (completed) => completed.lessonId === lessonId
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{courseTitle}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progress.percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 mb-3">Lessons</h4>
        {lessons.map((lesson, index) => (
          <div key={lesson._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="flex-shrink-0">
              {isLessonCompleted(lesson._id) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {index + 1}. {lesson.title}
              </p>
              <p className="text-xs text-gray-500">{lesson.duration} minutes</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {progress.completedLessons.length} of {lessons.length} lessons completed
          </span>
          <span className="font-medium text-gray-900">
            {progress.percentage === 100 ? 'Completed!' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
