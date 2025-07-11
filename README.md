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

## 🚀 Deployment

### Deploying to Vercel

1. **Prepare for deployment**
   ```bash
   # Run the deployment preparation script
   ./deploy.sh
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy on Vercel**
   - Connect your GitHub repository to Vercel
   - **Set environment variables in Vercel dashboard:**
     1. Go to your project in Vercel dashboard
     2. Navigate to **Settings > Environment Variables**
     3. Add the following variables for **Production**, **Preview**, and **Development**:
        - `NEXT_PUBLIC_API_URL`: `https://your-backend-api.vercel.app/api`
        - `NEXT_PUBLIC_APP_URL`: `https://your-app-name.vercel.app`
   - Deploy automatically on push

### Setting Environment Variables in Vercel

1. **In Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Add each variable for all environments (Production, Preview, Development)

2. **Required Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://online-learning-platform-with-chat-eight.vercel.app/api
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

3. **Important Notes:**
   - Don't use `@secret` references in `vercel.json` unless you've created those secrets
   - Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - Set variables for all environments to ensure consistent behavior

### Important Deployment Notes

- The project automatically handles platform-specific dependencies
- `package-lock.json` is ignored to prevent Windows/Linux conflicts
- SWC dependencies are automatically installed for the target platform
- Vercel configuration is optimized for Next.js deployment

### Environment Variables

For production deployment, set these variables in your Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

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
