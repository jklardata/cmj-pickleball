# CMJ Pickleball Management System

A weekly pickleball game management system with user authentication and automated player list management.

## Features

- **User Authentication**: Secure sign-in with Replit OAuth
- **Weekly Game Management**: Automatic game creation for each week
- **Player Registration**: Sign up or remove from weekly games
- **Automated Scheduling**: 
  - Registration freezes every Friday at 11:59 PM
  - Player lists reset every Sunday at 12:00 AM
- **Real-time Player List**: View current week's registered players

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: OpenID Connect (Replit)
- **Scheduling**: Node-cron

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Replit application credentials (for OAuth)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cmj-pickleball
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/cmj_pickleball
SESSION_SECRET=your-long-random-session-secret
REPL_ID=your-replit-app-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost:5000,your-domain.com
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Database Schema

The application uses the following tables:
- `users` - User profiles from authentication
- `sessions` - Session storage for authentication
- `weekly_games` - Weekly game instances
- `player_registrations` - Player sign-ups for each game

### API Endpoints

- `GET /api/auth/user` - Get current user
- `GET /api/current-game` - Get current week's game
- `POST /api/register` - Register for current game
- `DELETE /api/unregister` - Remove registration
- `GET /api/game/:gameId/registrations` - Get player list
- `GET /api/my-registration/:gameId` - Check registration status

## Deployment

### Environment Variables for Production

```env
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-production-session-secret
REPL_ID=your-replit-app-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-production-domain.com
NODE_ENV=production
```

### Build for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
=======
# cmj-pickleball
Pickleball Scheduling/Reservation App
