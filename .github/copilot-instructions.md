# GitHub Copilot Instructions for ShiftLog

## Project Overview

ShiftLog is a lightweight and flexible work management system built with Node.js, TypeScript, Express, and EJS. It provides work order recording, shift activity logging, and timesheet tracking capabilities for municipal governments.

## Technology Stack

- **Runtime**: Node.js with ES Modules (`type: "module"`)
- **Language**: TypeScript (compiled to JavaScript, with `.d.ts`, `.js`, and `.ts` files checked in)
- **Web Framework**: Express 5.x
- **View Engine**: EJS templates
- **Database**: Microsoft SQL Server (via `@cityssm/mssql-multi-pool`)
- **CSS Framework**: Bulma
- **Mapping**: Leaflet with OpenStreetMap
- **Testing**: Node.js native test runner (`node --test`)
- **Build/Development**: TypeScript compiler with `nodemon` for hot reloading

## Code Style and Standards

### TypeScript Configuration

- Use ES2023 target with Node16 module resolution
- Enable strict null checks
- Declaration files (`.d.ts`) are generated and committed alongside source files
- Files use `.ts` extension, compile to `.js`, with matching `.d.ts` files

### Linting and Formatting

- **ESLint**: Uses `eslint-config-cityssm` configuration
- **Prettier**: Uses `prettier-config-cityssm` configuration
- **Security**: Uses `eslint-plugin-no-unsanitized` to prevent XSS vulnerabilities
- **Spell Checking**: Uses `@cspell/eslint-plugin` with custom dictionary

### Coding Conventions

1. **Imports**: Use ES Module syntax (`import`/`export`) with `.js` extensions for local files
   ```typescript
   import { something } from './helpers/something.js'
   ```

2. **File Naming**: Use camelCase for files, with `.helpers.ts` suffix for helper modules
   - Examples: `settings.helpers.ts`, `database.helpers.ts`, `config.helpers.ts`

3. **No Magic Numbers**: Use the `@typescript-eslint/no-magic-numbers` rule; define constants for numeric values

4. **Escaping and Sanitization**: 
   - Use `cityssm.escapeHTML()` for user-generated content in templates
   - Use approved sanitization methods: `cityssm.dateToString`, `cityssm.escapeHTML`
   - URL builders are considered safe: `buildShiftURL`, `buildWorkOrderURL`, `buildTimesheetURL`

5. **Debug Logging**: Use `debug` package with namespace pattern:
   ```typescript
   import Debug from 'debug'
   const debug = Debug('shiftlog:module-name')
   ```

6. **Async/Await**: Prefer `async/await` over Promise chains

7. **Comments**: Only add comments when necessary to explain complex logic; code should be self-documenting

## Project Structure

```
├── app/                    # Express application setup and middleware
├── handlers/               # Route handlers organized by feature
│   ├── workOrders-get/    # GET handlers for work orders
│   ├── workOrders-post/   # POST handlers for work orders
│   └── ...
├── helpers/                # Utility functions and shared logic
├── database/               # SQL queries and database operations
│   ├── app/               # Application-level database operations
│   ├── workOrders/        # Work order database operations
│   └── ...
├── routes/                 # Express route definitions
├── views/                  # EJS templates
├── public/                 # Static assets (CSS, JavaScript, images)
├── tasks/                  # Background tasks and scheduled jobs
├── types/                  # TypeScript type definitions
└── test/                   # Test files
```

## Development Workflow

### Building and Running

- **Development Mode**: `npm run dev` (starts with hot reloading and debug output)
- **Production Mode**: `npm start`
- **Testing**: `npm test` (uses Node.js native test runner)
- **Coverage**: `npm run coverage` (uses c8 for coverage reports)

### Testing Practices

- Tests use Node.js native test runner (no Jest, Mocha, etc.)
- Test files use `.test.ts` extension
- Use `node:test` for test utilities (`describe`, `it`, `before`, `after`, etc.)
- Integration tests may use Cypress for end-to-end testing
- Tests require `TEST_DATABASES=true` environment variable for database tests

### Database

- Uses Microsoft SQL Server with connection pooling
- Database operations are in `database/` directory, organized by feature
- SQL files use `.sql` extension
- Database initialization script: `database/initializeDatabase.sql`

## Security Practices

1. **CSRF Protection**: Use `csrf-csrf` middleware for form submissions
2. **Input Sanitization**: Always escape user input with `cityssm.escapeHTML()` before rendering
3. **No Direct SQL**: Use parameterized queries via the database helpers
4. **Rate Limiting**: Use `express-rate-limit` for API endpoints
5. **Session Management**: Use `express-session` with file store
6. **Authentication**: Use `@cityssm/authentication-helper` for user authentication

## API Integrations

ShiftLog integrates with several external systems:
- **Avanti**: Employee management via `@cityssm/avanti-api`
- **Worktech**: Work order sync via `@cityssm/worktech-api`
- **ArcGIS**: GIS data via `@cityssm/esri-mapserver-layer-dl`

## Configuration

- Configuration files are in `data/config.js` by default
- Use `--config` flag to specify alternative configuration files
- Default configuration values are in `helpers/config.defaults.ts`
- Access config with `getConfigProperty()` from `helpers/config.helpers.js`

## Key Dependencies

- **Caching**: `@cacheable/node-cache`
- **Date/Time**: `@cityssm/utils-datetime`, `flatpickr`
- **Scheduling**: `@cityssm/scheduled-task`
- **File Upload**: `multer`
- **iCalendar**: `ical-generator`
- **Barcode**: `@cityssm/jsbarcode-svg`
- **CSV**: `papaparse`

## Best Practices for Contributing

1. Follow the existing code style and conventions
2. Run linters before committing code
3. Ensure all tests pass before submitting changes
4. Keep changes minimal and focused on the specific issue
5. Update documentation if adding new features
6. Check for security vulnerabilities using the linting rules
7. Use TypeScript's type system; avoid `any` when possible
8. Maintain the multi-file pattern (`.ts`, `.js`, `.d.ts`)

## Common Patterns

### Express Route Handler Pattern
```typescript
import type { Request, Response } from 'express'

export function handler(request: Request, response: Response): void {
  // Handler logic
  response.render('viewName', { data })
}
```

### Database Query Pattern
```typescript
import { acquireDatabasePool } from '../helpers/database.helpers.js'

export async function getSomething(id: number): Promise<SomeType | undefined> {
  const pool = await acquireDatabasePool()
  const result = await pool.request()
    .input('id', id)
    .query('SELECT * FROM TableName WHERE id = @id')
  
  return result.recordset[0]
}
```

### Helper Module Pattern
```typescript
// helpers/something.helpers.ts
export function doSomething(): void {
  // Implementation
}
```

## Notes for AI Assistants

- This project uses TypeScript but commits both source (`.ts`) and compiled (`.js`, `.d.ts`) files
- Always update all three file types when making changes
- Use ES Module syntax exclusively (no CommonJS)
- Import local modules with `.js` extension, even in TypeScript files
- Follow the established patterns for organizing code by feature
- Respect the security practices, especially around input sanitization
- Test database operations require `TEST_DATABASES=true` environment variable
