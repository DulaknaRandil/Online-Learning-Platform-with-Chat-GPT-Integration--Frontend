# Online Learning Platform - Frontend

A modern, responsive frontend for an online learning platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js App Router** for modern React architecture
- **TypeScript** for type safety
- **Tailwind CSS** for responsive UI
- **Authentication** with JWT and context API
- **Role-based Access** for students and instructors
- **Course Management** for instructors
- **Course Enrollment** for students
- **Personalized Dashboard** for users
- **AI-powered Course Recommendations** using ChatGPT

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin routes
│   ├── auth/             # Authentication routes
│   ├── courses/          # Course browsing and learning
│   ├── instructor/       # Instructor dashboard and course mgmt
│   ├── recommendations/  # AI-powered recommendations
│   ├── student/          # Student dashboard
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # UI elements
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
├── services/             # API service wrappers
│   ├── courseService.ts
│   ├── enrollmentService.ts
│   └── recommendationService.ts
└── types/                # TypeScript type definitions
    └── index.ts
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## 🎨 UI Features

- **Responsive Design** for all screen sizes
- **Modern UI** with animations and transitions
- **Accessible Components** following WCAG guidelines
- **Loading States** for better user experience

## 📱 User Interfaces

### Student Features
- **Course Catalog** with filtering and search
- **Course Details** with curriculum and reviews
- **Enrollment** functionality
- **Learning Dashboard** with progress tracking
- **AI Recommendations** based on interests
- **Profile Management**

### Instructor Features
- **Course Creation** with rich text editor
- **Course Management** dashboard
- **Student Enrollment** tracking
- **Analytics** for course performance
- **Profile Management**

## 🤖 AI Integration

The platform leverages ChatGPT for intelligent course recommendations:

### Features
- **Natural Language Queries** for course discovery
- **Personalized Recommendations** based on learning goals
- **Learning Path Generation** for specific skills
- **Interactive Chat Interface** for course exploration

### Example Use Cases
- Users can ask questions like "I want to become a full-stack developer"
- The system returns a curated list of relevant courses
- Recommendations consider the user's level and previous enrollments
- Explanations for why each course is recommended

## 🔐 Authentication

- **JWT-based Authentication** with refresh tokens
- **Protected Routes** for authenticated users
- **Role-based Access Control** for different user types
- **Persistent Login** with local storage

## 🌐 API Integration

- **Axios-based HTTP Client** for API communication
- **Interceptors** for authentication and error handling
- **Service Layer** for organized API calls
- **Type-safe Responses** with TypeScript interfaces

## 📄 License

This project is licensed under the MIT License.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
