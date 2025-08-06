# Fastify to NestJS Migration Guide

This document provides a comprehensive guide for migrating your Node.js habit tracking application from Fastify to NestJS while preserving the domain-driven design architecture.

## 🚀 Migration Overview

### **What Changed**
- **Framework**: Fastify → NestJS
- **Architecture**: Preserved clean architecture and domain-driven design
- **Dependencies**: Updated to NestJS ecosystem
- **Testing**: Enhanced with NestJS testing utilities
- **Documentation**: Improved Swagger integration

### **What Stayed the Same**
- **Domain Logic**: Habit entities and value objects remain unchanged
- **Database Schema**: No changes to Prisma schema
- **API Endpoints**: Same URL structure and responses
- **Business Rules**: All domain validation and business logic preserved

## 📁 New Project Structure

```
src-nestjs/
├── main.ts                           # NestJS bootstrap
├── app.module.ts                     # Root application module
├── domain/                           # Domain layer (unchanged)
│   ├── entities/
│   │   └── habit.entity.ts          # Domain entities
│   ├── value-objects/
│   │   └── habit-name.ts             # Value objects
│   └── shared/
│       └── types/
│           └── common.ts             # Common types and interfaces
├── infrastructure/                   # Infrastructure layer
│   ├── database/
│   │   ├── database.module.ts        # Database module
│   │   └── prisma.service.ts         # Prisma service
│   ├── config/
│   │   └── config.validation.ts     # Environment validation
│   ├── filters/
│   │   └── http-exception.filter.ts # Global exception filter
│   ├── interceptors/
│   │   └── logging.interceptor.ts   # Request/response logging
│   ├── exceptions/
│   │   └── app.exceptions.ts        # Custom exception classes
│   ├── dto/
│   │   ├── pagination-query.dto.ts  # Pagination DTOs
│   │   └── paginated-response.dto.ts
│   └── health/
│       └── health.controller.ts     # Health check endpoint
├── habits/                          # Habits feature module
│   ├── controllers/
│   │   └── habits.controller.ts     # REST API controllers
│   ├── services/
│   │   └── habits.service.ts        # Business logic services
│   ├── repositories/
│   │   └── habits.repository.ts     # Data access layer
│   ├── interfaces/
│   │   └── habits-repository.interface.ts # Repository contracts
│   ├── dto/
│   │   ├── create-habit.dto.ts      # Request/response DTOs
│   │   ├── update-habit.dto.ts
│   │   └── habit-response.dto.ts
│   └── habits.module.ts             # Habits module definition
└── books/                           # Books feature module
    ├── books.module.ts
    ├── controllers/
    ├── services/
    └── repositories/
```

## 🔧 Key Migration Changes

### **1. Dependency Injection**

**Before (Fastify):**
```javascript
// Manual dependency management
const habitsRepository = new HabitsRepository(prisma);
const habitsService = new HabitsService(habitsRepository);
```

**After (NestJS):**
```typescript
// Automatic dependency injection
@Injectable()
export class HabitsService {
  constructor(
    @Inject('IHabitsRepository')
    private readonly habitsRepository: IHabitsRepository
  ) {}
}
```

### **2. Route Definition**

**Before (Fastify):**
```javascript
// Route registration in separate files
app.register(habitRoutes, { prefix: '/api/v1/habits' });
```

**After (NestJS):**
```typescript
// Decorator-based routing
@Controller('habits')
@Version('1')
export class HabitsController {
  @Get()
  async findAll(): Promise<HabitResponseDto[]> {
    // Implementation
  }
}
```

### **3. Validation**

**Before (Fastify):**
```javascript
// Manual validation or JSON schemas
const createHabitSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 50 }
  }
};
```

**After (NestJS):**
```typescript
// Class-validator decorators
export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
```

### **4. Error Handling**

**Before (Fastify):**
```javascript
// Custom error handler function
app.setErrorHandler((error, request, reply) => {
  // Handle errors
});
```

**After (NestJS):**
```typescript
// Exception filter classes
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    // Handle exceptions
  }
}
```

## 🛠️ Migration Steps

### **Step 1: Install Dependencies**
```bash
# Replace your current package.json with package-nestjs.json
mv package.json package-fastify.json.backup
mv package-nestjs.json package.json

# Install dependencies
npm install
```

### **Step 2: Copy Source Code**
```bash
# Copy the new NestJS source code structure
cp -r src-nestjs/* src/

# Verify the new structure
ls -la src/
```

### **Step 3: Update Configuration**
```bash
# Copy NestJS configuration files
cp src-nestjs/nest-cli.json .
cp src-nestjs/tsconfig.json .

# Update your .env file (no changes needed - same variables)
# DATABASE_URL, PORT, CORS_ORIGIN, etc. remain the same
```

### **Step 4: Run the Application**
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### **Step 5: Verify Migration**
```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Test habits endpoint
curl http://localhost:3000/api/v1/habits

# Check API documentation
open http://localhost:3000/docs
```

## 📊 API Compatibility

All existing API endpoints remain the same:

| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `GET /api/v1/health` | GET | Health check | ✅ Compatible |
| `GET /api/v1/habits` | GET | List habits | ✅ Compatible |
| `POST /api/v1/habits` | POST | Create habit | ✅ Compatible |
| `GET /api/v1/habits/:id` | GET | Get habit | ✅ Compatible |
| `PATCH /api/v1/habits/:id` | PATCH | Update habit | ✅ Compatible |
| `DELETE /api/v1/habits/:id` | DELETE | Delete habit | ✅ Compatible |
| `POST /api/v1/habits/:id/increment-action` | POST | Increment actions | ✅ Compatible |

## 🧪 Testing

### **Updated Test Configuration**
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### **New Testing Features**
- **Enhanced Mocking**: Better dependency injection mocking
- **Module Testing**: Test modules in isolation
- **Supertest Integration**: Same request testing capabilities
- **Coverage Reports**: Improved coverage reporting

## 🚢 Docker Updates

Minimal Docker changes needed:

```dockerfile
# Update your Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Build application
RUN npm run build

# Start application
CMD ["npm", "run", "start:prod"]
```

## ⚡ Performance Improvements

### **NestJS Benefits:**
1. **Better DI Container**: More efficient dependency resolution
2. **Built-in Caching**: Easy to add caching layers
3. **Interceptors**: Better request/response transformation
4. **Guards**: Enhanced authentication/authorization
5. **Pipes**: Automatic validation and transformation

### **Migration Performance:**
- ✅ Same response times
- ✅ Same memory usage
- ✅ Better error handling
- ✅ Enhanced logging
- ✅ Improved type safety

## 🔐 Security

Security features remain the same:
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Validation**: Input sanitization

## 📈 Monitoring & Logging

Enhanced logging with NestJS:
- **Structured Logging**: Better log format
- **Request Tracking**: Improved request/response logging
- **Error Tracking**: Enhanced error reporting
- **Health Checks**: Database connectivity monitoring

## 🎯 Next Steps

After migration, consider these enhancements:

1. **Authentication**: Add JWT-based authentication
2. **Caching**: Implement Redis caching
3. **Microservices**: Split into domain-based services
4. **GraphQL**: Add GraphQL API alongside REST
5. **Monitoring**: Add Prometheus metrics
6. **Documentation**: Enhanced API documentation

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Prisma Integration](https://docs.nestjs.com/recipes/prisma)
- [Clean Architecture with NestJS](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

## ❓ Troubleshooting

### **Common Issues:**

1. **Import Errors**: Update import paths for the new structure
2. **Dependency Issues**: Clear node_modules and reinstall
3. **TypeScript Errors**: Update tsconfig.json paths
4. **Database Connection**: Verify DATABASE_URL in .env

### **Migration Support:**

If you encounter issues during migration:
1. Check the logs for specific error messages
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check that all dependencies are installed

---

**Migration completed successfully! 🎉**

Your habit tracking application now runs on NestJS with improved architecture, better developer experience, and enhanced scalability while maintaining full backward compatibility.