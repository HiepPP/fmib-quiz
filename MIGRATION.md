# Migration Guide: Vercel Blob to Vercel Postgres

This guide explains how to migrate your FMIB Quiz application from Vercel Blob storage to Vercel Postgres database.

## Overview

The migration moves quiz question storage from file-based storage (Vercel Blob) to a relational database (Vercel Postgres), providing better data management, querying capabilities, and relational integrity.

## Changes Made

### 1. Database Schema

- **quiz_questions table**: Stores question text and metadata
- **question_answers table**: Stores answers with foreign key relationship to questions
- **Automatic backups**: Handled by Vercel Postgres instead of manual blob backups

### 2. New Files Created

- `src/db/schema.sql`: Database schema definition
- `src/lib/db.ts`: Database utility functions
- `src/lib/quiz-storage.ts`: New storage layer using Postgres
- `src/pages/api/quiz-questions.ts`: New API endpoint for database operations
- `src/pages/api/debug-db.ts`: Debug API for database configuration

### 3. Updated Files

- `package.json`: Added @vercel/postgres dependency
- `src/lib/dev-storage.ts`: Added database configuration checking
- `src/pages/admin.tsx`: Updated to use new storage system
- `.env.local`: Added database configuration placeholder

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @vercel/postgres
```

### 2. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose your region
6. Click **Create Database**

### 3. Set Environment Variables

In your Vercel project dashboard, add the following environment variables:

```
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_prisma_connection_string
POSTGRES_URL_NON_POOLING=your_non_pooling_connection_string
```

### 4. Run Database Migration

Execute the SQL schema from `src/db/schema.sql` in your Vercel Postgres database:

1. Go to your Vercel Postgres dashboard
2. Click **Query**
3. Copy and paste the contents of `src/db/schema.sql`
4. Click **Execute**

### 5. Deploy Changes

Deploy your application to Vercel to apply the changes.

## API Changes

### Old Endpoint (Deprecated)
- `POST /api/blob-questions` - No longer used

### New Endpoint
- `POST /api/quiz-questions` - New database-backed endpoint
- `GET /api/quiz-questions` - Fetch questions from database
- `DELETE /api/quiz-questions` - Clear all questions

### Debug Endpoint
- `GET /api/debug-db` - Test database configuration and connectivity

## Data Migration (Optional)

If you have existing questions in Vercel Blob storage and want to migrate them:

1. Use the existing admin panel to export your questions
2. Import them using the new database-backed system
3. The new system will automatically save them to Postgres

## Benefits of Migration

### 1. Better Data Management
- Relational integrity between questions and answers
- ACID compliance for data consistency
- Automatic indexing for better performance

### 2. Enhanced Querying
- Complex queries and filtering
- Aggregation and reporting capabilities
- Better search functionality

### 3. Improved Security
- Connection pooling and security
- Row-level security capabilities
- Better access control

### 4. Scalability
- Better handling of concurrent operations
- Optimized for read/write operations
- Automatic backups and point-in-time recovery

## Troubleshooting

### Database Connection Issues

1. Check your `POSTGRES_URL` environment variable
2. Ensure your database is running in Vercel
3. Use the `/api/debug-db` endpoint to test connectivity

### Migration Issues

1. Ensure the database schema is properly created
2. Check for SQL syntax errors in the schema
3. Verify all required environment variables are set

### Performance Issues

1. Check if indexes are properly created
2. Monitor database query performance
3. Use Vercel's database analytics tools

## Backward Compatibility

- The old blob storage files remain in place for reference
- Existing localStorage fallbacks continue to work
- Admin panel UI remains unchanged except for storage type display

## Support

For issues related to:
- **Vercel Postgres**: Check Vercel documentation
- **Database queries**: Review the `src/lib/db.ts` file
- **API endpoints**: Check the `src/pages/api/quiz-questions.ts` file
- **Configuration**: Use the debug endpoint `/api/debug-db`