'use client';

import { RouteGuard } from '@/components/common/RouteGuard';
import GPTChatComponent from '@/components/GPTChatComponent';

export default function GPTRecommendationsPage() {
  return (
    <RouteGuard requiredRole="student">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Course Recommendations</h1>
          <p className="text-gray-600">
            Get personalized course recommendations powered by AI. Tell me your goals and I&apos;ll help you find the perfect courses.
          </p>
        </div>
        
        <GPTChatComponent />
      </div>
    </RouteGuard>
  );
}
