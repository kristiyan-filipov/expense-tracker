# Expense Tracker

A simple and practical web application to track daily expenses, manage budgets, and visualize spending habits.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Database & Auth:** [Supabase](https://supabase.com/) (Auth, Database, `@supabase/ssr`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Utilities:** [date-fns](https://date-fns.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## Features

- **User Authentication:** Secure sign-up, sign-in, and sign-out powered by Supabase Auth with Server Actions.
- **Dashboard:** An overview of your spending, including total expenses, charts, and recent transaction history.
- **Expense Logging:** Quickly add new expenses with categories, descriptions, amounts, and custom dates.

## Getting Started

### 1. Prerequisites

Ensure you have Node.js and npm installed.

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Installation

Install project dependencies:

```bash
npm install
```

### 4. Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.
