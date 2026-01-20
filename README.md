# TaskTask - Task Management App

A beautiful task management app with gamification and pet raising system for office workers.

## Features

### Core Features
- ✅ Task CRUD (Create, Read, Update, Delete)
- ✅ Tags/Folders system (nested tags)
- ✅ Tally counter (+1 per task)
- ✅ Pomodoro timer (25 minutes)
- ✅ Manual timer tracker
- ✅ Time away tracking
- ✅ Reminder system

### Gamification
- ✅ XP & Level system
- ✅ Coins system
- ✅ Streak tracking
- ✅ Shop (buy items with coins)
- ✅ Inventory system

### Pet System
- ✅ Pet display
- ✅ Feeding system
- ✅ Pet stats (hunger, happiness, energy, health)
- ✅ Activity system
- ✅ Evolution

### Views
- ✅ Main Dashboard
- ✅ List View
- ✅ Kanban View
- ✅ Calendar View

### Themes
- ✅ Dark Theme (Midnight)
- ✅ Fresh Mint
- ✅ Clean Slate

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State**: Zustand, React Query
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Run the SQL migrations in `supabase/schema.sql`
3. Copy `.env.local.example` to `.env.local`
4. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tasktask/
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   ├── tasks/             # Task components
│   ├── timer/             # Timer components
│   ├── pet/               # Pet components
│   ├── shop/              # Shop components
│   └── common/            # Common components
├── lib/
│   └── supabase.ts        # Supabase client
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── package.json
```

## Database Schema

The app uses the following tables:
- `profiles` - User profiles with XP, coins, level
- `tasks` - Task management
- `tags` - Nested tag/folder system
- `task_tags` - Task-Tag relationships
- `pomodoro_sessions` - Pomodoro tracking
- `user_pets` - Pet data
- `pet_foods` - Food items for pets
- `shop_items` - Shop inventory
- `user_inventory` - User's purchased items

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
