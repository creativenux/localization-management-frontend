# Helium Localization Manager

A full-stack localization management system built as a take-home assignment for Helium. This application allows users to manage translations across multiple languages and projects efficiently.

## 🚀 Tech Stack

### Frontend
- **Next.js 15**: React framework for optimal performance
- **React Query (TanStack Query)**: For efficient data fetching and caching
  - Implemented optimistic updates for better UX
  - Automatic background refetching for data consistency
  - Efficient cache invalidation strategies
- **Zustand**: For state management
  - Lightweight and performant alternative to Redux
  - Persistent storage for user preferences
  - Type-safe state management
- **Tailwind CSS**: For responsive and maintainable styling
  - Dark mode support
  - Consistent design system
  - Utility-first approach for rapid development

## 💡 Key Features & Implementation Details

### Core Features
1. **Project Management**
   - Sidebar navigation for projects, languages, and categories
   - Easy switching between different projects
   - Persistent project selection

2. **Translation Management**
   - Main translation key manager interface
   - Individual translation editing
   - Bulk editing capabilities
   - Add new translations with pre-filled content
   - Real-time search and filtering

3. **User Experience**
   - Responsive design for desktop and tablet screens
   - Dark mode support
   - Loading states and error handling
   - Intuitive navigation and workflow

### Technical Implementation
1. **Performance Optimizations**
   - Implemented 10 per page pagination for large datasets
   - Used React Query's caching to minimize API calls
   - Optimistic updates for instant UI feedback

2. **State Management**
   - Zustand for global state (projects, languages, categories)
   - Local state for UI components
   - Persistent storage for user preferences

3. **Code Quality & Architecture**
   - TypeScript for type safety
   - Modular and reusable components
   - Centralized API service layer
   - Proper error handling
   - Clean and maintainable code structure

## 🛠️ Local Development

1. Clone the repository:
```bash
git clone https://github.com/creativenux/localization-management-frontend.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Live Demo

[https://localization-management-frontend.vercel.app/](https://localization-management-frontend.vercel.app/)

## ⏱️ Project Timeline

While the assignment suggested a 2-3 hour completion time, I completed it in approximately 5 hours.
