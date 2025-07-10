'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, Sparkles } from 'lucide-react';

export default function Home() {
	const { user } = useAuth();

	return (
		<div className="space-y-16">
			{/* Hero Section */}
			<section className="text-center py-20">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
						Learn Anything, Anywhere with{' '}
						<span className="text-blue-600">AI-Powered</span> Recommendations
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Join thousands of learners and instructors in our comprehensive online
						learning platform. Get personalized course recommendations powered by
						ChatGPT.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						{user ? (
							<div className="flex gap-4">
								{user.role === 'admin' && (
									<Link href="/admin/dashboard">
										<Button size="lg" className="text-lg px-8 py-6">
											Go to Admin Dashboard
										</Button>
									</Link>
								)}
								{user.role === 'instructor' && (
									<>
										<Link href="/instructor/dashboard">
											<Button size="lg" className="text-lg px-8 py-6">
												Instructor Dashboard
											</Button>
										</Link>
										<Link href="/instructor/courses/create">
											<Button size="lg" variant="outline" className="text-lg px-8 py-6">
												Create New Course
											</Button>
										</Link>
									</>
								)}
								{user.role === 'student' && (
									<>
										<Link href="/student/dashboard">
											<Button size="lg" className="text-lg px-8 py-6">
												My Learning Dashboard
											</Button>
										</Link>
										<Link href="/recommendations">
											<Button size="lg" variant="outline" className="text-lg px-8 py-6">
												Get AI Recommendations
											</Button>
										</Link>
									</>
								)}
								{!user.role && (
									<>
										<Link href="/courses">
											<Button size="lg" className="text-lg px-8 py-6">
												Browse Courses
											</Button>
										</Link>
										<Link href="/recommendations">
											<Button size="lg" variant="outline" className="text-lg px-8 py-6">
												Get AI Recommendations
											</Button>
										</Link>
									</>
								)}
							</div>
						) : (
							<div className="flex gap-4">
								<Link href="/auth/register">
									<Button size="lg" className="text-lg px-8 py-6">
										Get Started Free
									</Button>
								</Link>
								<Link href="/courses">
									<Button
										size="lg"
										variant="outline"
										className="text-lg px-8 py-6"
									>
										Browse Courses
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Role-specific section */}
			{user && (
				<section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8 rounded-xl">
					<div className="max-w-4xl mx-auto px-4">
						{user.role === 'admin' && (
							<div className="text-center">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Portal</h2>
								<p className="text-gray-700 mb-6">Manage your platform, users, and courses from your admin dashboard.</p>
								<div className="flex justify-center gap-4">
									<Link href="/admin/dashboard">
										<Button>Admin Dashboard</Button>
									</Link>
								</div>
							</div>
						)}
						{user.role === 'instructor' && (
							<div className="text-center">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor Portal</h2>
								<p className="text-gray-700 mb-6">Create and manage your courses, track student enrollments, and build your instructor profile.</p>
								<div className="flex justify-center gap-4">
									<Link href="/instructor/dashboard">
										<Button>My Dashboard</Button>
									</Link>
									<Link href="/instructor/courses/create">
										<Button variant="outline">Create New Course</Button>
									</Link>
								</div>
							</div>
						)}
						{user.role === 'student' && (
							<div className="text-center">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Student Portal</h2>
								<p className="text-gray-700 mb-6">Continue your learning journey, track your course progress, and discover new courses tailored to your interests.</p>
								<div className="flex justify-center gap-4">
									<Link href="/student/dashboard">
										<Button>My Dashboard</Button>
									</Link>
									<Link href="/recommendations">
										<Button variant="outline">Get Course Recommendations</Button>
									</Link>
								</div>
							</div>
						)}
					</div>
				</section>
			)}

			{/* Features Section */}
			<section>
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Why Choose EduPlatform?
					</h2>
					<p className="text-lg text-gray-600">
						We combine the best of online learning with cutting-edge AI technology
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					<Card className="text-center">
						<CardHeader>
							<BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
							<CardTitle>Expert-Led Courses</CardTitle>
							<CardDescription>
								Learn from industry experts with real-world experience
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
							<CardTitle>AI-Powered Recommendations</CardTitle>
							<CardDescription>
								Get personalized course suggestions based on your goals using
								ChatGPT
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
							<CardTitle>Community Learning</CardTitle>
							<CardDescription>
								Join a vibrant community of learners and instructors
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</section>

			{/* Stats Section */}
			<section className="bg-blue-50 rounded-lg p-8">
				<div className="grid md:grid-cols-3 gap-8 text-center">
					<div>
						<h3 className="text-3xl font-bold text-blue-600 mb-2">10,000+</h3>
						<p className="text-gray-600">Active Students</p>
					</div>
					<div>
						<h3 className="text-3xl font-bold text-blue-600 mb-2">500+</h3>
						<p className="text-gray-600">Expert Instructors</p>
					</div>
					<div>
						<h3 className="text-3xl font-bold text-blue-600 mb-2">1,000+</h3>
						<p className="text-gray-600">Available Courses</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="text-center py-16">
				<div className="max-w-2xl mx-auto">
					{!user && (
						<>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Ready to Start Learning?
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								Join thousands of students already learning on EduPlatform
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/auth/register?role=student">
									<Button size="lg" className="text-lg px-8 py-6">
										Join as Student
									</Button>
								</Link>
								<Link href="/auth/register?role=instructor">
									<Button
										size="lg"
										variant="outline"
										className="text-lg px-8 py-6"
									>
										Teach on EduPlatform
									</Button>
								</Link>
							</div>
						</>
					)}
					{user && user.role === 'student' && (
						<>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Find Your Next Learning Opportunity
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								Discover courses tailored to your career goals with AI recommendations
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/courses">
									<Button size="lg" className="text-lg px-8 py-6">
										Browse All Courses
									</Button>
								</Link>
								<Link href="/recommendations">
									<Button
										size="lg"
										variant="outline"
										className="text-lg px-8 py-6"
									>
										Get AI Recommendations
									</Button>
								</Link>
							</div>
						</>
					)}
					{user && user.role === 'instructor' && (
						<>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Share Your Knowledge
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								Create engaging courses and reach students worldwide
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/instructor/courses/create">
									<Button size="lg" className="text-lg px-8 py-6">
										Create New Course
									</Button>
								</Link>
								<Link href="/instructor/dashboard">
									<Button
										size="lg"
										variant="outline"
										className="text-lg px-8 py-6"
									>
										Manage Your Courses
									</Button>
								</Link>
							</div>
						</>
					)}
					{user && user.role === 'admin' && (
						<>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Platform Administration
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								Manage platform users, courses, and more
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/admin/dashboard">
									<Button size="lg" className="text-lg px-8 py-6">
										Go to Admin Dashboard
									</Button>
								</Link>
							</div>
						</>
					)}
				</div>
			</section>
		</div>
	);
}
