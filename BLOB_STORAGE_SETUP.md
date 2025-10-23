# Vercel Blob Storage Implementation

This document explains how the FMIB Quiz application uses Vercel Blob storage to persist quiz questions across deployments.

## 🎯 Overview

The quiz application has been migrated from localStorage to Vercel Blob storage to ensure data persistence when deployed to Vercel. This implementation includes:

- ✅ **Persistent Storage**: Questions are stored in Vercel Blob storage and persist across deployments
- ✅ **Development Fallback**: Uses localStorage when blob storage is not configured (development mode)
- ✅ **Error Handling**: Comprehensive error handling with fallback mechanisms
- ✅ **Backup System**: Automatic backup creation when saving questions
- ✅ **Migration Support**: Easy migration from existing localStorage data

## 📁 File Structure

```
src/lib/
├── blob-storage.ts     # Main blob storage implementation
├── dev-storage.ts      # Development fallback utilities
└── storage.ts          # Original localStorage utilities (still used for sessions)

src/pages/
├── admin.tsx           # Updated to use blob storage
└── api/quiz/
    └── questions.ts    # Updated API endpoint

.env.local.example      # Environment variables template
```

## 🚀 Setup Instructions

### 1. Development Setup (Optional)

For local development, the app will automatically fall back to localStorage if blob storage is not configured.

```bash
# Copy the environment template
cp .env.local.example .env.local

# The app will work without configuration in development mode
npm run dev
```

### 2. Production Setup (Required for Deployment)

#### Step 1: Create Vercel Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Blob** storage
6. Choose your region and create the store

#### Step 2: Configure Environment Variables

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add the following variable:
   ```
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```
3. The token is available in your Blob store settings

#### Step 3: Deploy

```bash
# Deploy to Vercel
vercel --prod
```

## 🔧 How It Works

### Storage Flow

```
Admin Interface → blobStorage.saveQuestions() → Vercel Blob API
                                                    ↓
Quiz API ← blobStorage.getQuestions() ← Vercel Blob API
```

### Development Mode Flow

```
Admin Interface → blobStorage.saveQuestions() → localStorage (fallback)
                                                    ↓
Quiz API ← blobStorage.getQuestions() ← localStorage (fallback)
```

### Data Structure

Questions are stored as JSON in Vercel Blob storage:

```json
[
  {
    "id": "q1",
    "question": "What is the capital of France?",
    "answers": [
      { "id": "a1", "text": "London", "isCorrect": false },
      { "id": "a2", "text": "Paris", "isCorrect": true },
      { "id": "a3", "text": "Berlin", "isCorrect": false },
      { "id": "a4", "text": "Madrid", "isCorrect": false }
    ]
  }
]
```

## 📊 Features

### 1. **Automatic Backups**

Every time you save questions, a backup is automatically created with a timestamp:

```
quiz-questions-backup-2025-10-23T17-00-00-000Z.json
```

### 2. **Storage Information**

The admin panel shows:
- Total number of questions
- Number of available backups
- Storage usage statistics
- Storage type indicator

### 3. **Error Handling**

- ✅ Network errors: Fallback to cached questions
- ✅ Invalid data: Use default questions
- ✅ Configuration errors: Clear error messages with instructions
- ✅ Permission errors: Development mode fallback

### 4. **Migration Support**

If you have existing questions in localStorage, the system will automatically:
1. Detect localStorage questions on first load
2. Offer to migrate them to blob storage
3. Clear localStorage after successful migration

## 🔍 API Response

The quiz API now includes storage information:

```json
{
  "success": true,
  "message": "Questions retrieved successfully from Vercel Blob storage",
  "data": {
    "questions": [...],
    "totalQuestions": 5,
    "storageInfo": {
      "type": "vercel-blob",
      "persistent": true,
      "description": "Questions are stored in Vercel Blob storage and persist across deployments"
    }
  },
  "meta": {
    "storageVersion": "blob-storage",
    "version": "2.0.0"
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "BLOB_READ_WRITE_TOKEN not found"

**Solution**: Add the environment variable in your Vercel project settings.

#### 2. "Failed to fetch questions from blob storage"

**Solution**: Check your token permissions and ensure the blob store exists.

#### 3. Questions not persisting after deployment

**Solution**: Verify the environment variable is set in production (not just .env.local).

### Debug Mode

Enable debug logging by checking the browser console:

```javascript
// In browser console
localStorage.setItem('fmib_debug', 'true');
```

## 📈 Benefits

### Before (localStorage)
- ❌ Data lost on deployment
- ❌ Limited storage capacity
- ❌ No backup system
- ❌ No sharing between environments

### After (Vercel Blob)
- ✅ Persistent across deployments
- ✅ Virtually unlimited storage
- ✅ Automatic backups
- ✅ Global CDN distribution
- ✅ Version control friendly
- ✅ Production-ready

## 🔄 Migration from localStorage

If you're upgrading from the localStorage version:

1. **Automatic Detection**: The app detects existing localStorage questions
2. **Migration Prompt**: Offers to migrate to blob storage
3. **Backup Creation**: Creates a backup before migration
4. **Cleanup**: Removes localStorage data after successful migration

### Manual Migration

```javascript
// In browser console
const questions = JSON.parse(localStorage.getItem('fmib_quiz_questions'));
console.log('Questions to migrate:', questions);
```

## 🚨 Important Notes

1. **Session Storage**: User sessions still use localStorage for performance
2. **Development Mode**: localStorage fallback works only in development
3. **Production**: BLOB_READ_WRITE_TOKEN is required for production deployment
4. **Backups**: Backups are created automatically but can be managed manually
5. **Security**: API responses exclude correct answers for security

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment variables
3. Ensure your Vercel Blob store is properly configured
4. Check the network tab for failed API requests

## 🎉 Success Indicators

You'll know everything is working when you see:

- ✅ "Vercel Blob ✨" in the admin panel storage status
- ✅ "Loading questions from Vercel Blob..." in the loading state
- ✅ No error messages in the console
- ✅ Questions persist after redeployment
- ✅ Backup buttons working in the admin panel