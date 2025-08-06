# Habit Tracker - Node.js API

A modern, scalable habit tracking API built with Node.js, TypeScript, Fastify, and PostgreSQL following Clean Architecture principles.

## Features

- 🏗️ **Clean Architecture** with Domain-Driven Design
- 🚀 **High Performance** with Fastify framework
- 🔒 **Type Safety** with TypeScript and Zod validation
- 🗄️ **PostgreSQL** with Prisma ORM
- 📊 **API Documentation** with Swagger/OpenAPI
- 🧪 **Comprehensive Testing** with Jest
- 🔐 **Security** with Helmet, CORS, and Rate Limiting
- 📝 **Structured Logging** with Pino
- 🐳 **Docker Support** for development and production

## Architecture

```
src/
├── application/          # Use cases and business logic
├── domain/              # Domain entities and value objects
├── infrastructure/      # External concerns (DB, web, config)
└── shared/             # Shared utilities and types
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`
API Documentation at `http://localhost:3000/docs`

### Docker Development

```bash
# Start all services (API + PostgreSQL)
docker-compose -f docker-compose.dev.yml up --build

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check without emitting

## Database Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with test data

## Environment Variables

See `.env.example` for all available environment variables.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)

## API Endpoints

### Habits
- `GET /api/v1/habits` - List all habits
- `POST /api/v1/habits` - Create a new habit
- `GET /api/v1/habits/:id` - Get habit by ID
- `PATCH /api/v1/habits/:id` - Update habit
- `DELETE /api/v1/habits/:id` - Delete habit

### Books
- `GET /api/v1/books` - List all books
- `POST /api/v1/books` - Create a new book
- `GET /api/v1/books/:id` - Get book by ID
- `PATCH /api/v1/books/:id` - Update book

### Actions & Reading Logs
- Coming soon...

## Testing

The project follows Test-Driven Development (TDD) practices:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## Code Quality

- **ESLint** - Airbnb configuration with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit validation
- **TypeScript** - Strict mode enabled

## Contributing

1. Follow TDD methodology
2. Ensure all tests pass
3. Maintain code coverage above 80%
4. Follow the established architecture patterns
5. Update documentation as needed

## License

MIT