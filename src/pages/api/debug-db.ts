import type { NextApiRequest, NextApiResponse } from 'next'
import { quizQuestionDB } from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Log to Vercel function logs (visible in dashboard)
  console.log('=== DATABASE DEBUG START ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('POSTGRES_URL present:', !!process.env.POSTGRES_URL ? 'YES' : 'NO');
  console.log('POSTGRES_PRISMA_URL present:', !!process.env.POSTGRES_PRISMA_URL ? 'YES' : 'NO');
  console.log('POSTGRES_URL_NON_POOLING present:', !!process.env.POSTGRES_URL_NON_POOLING ? 'YES' : 'NO');
  console.log('All env keys (non-sensitive):', Object.keys(process.env).filter(key => !key.includes('URL') && !key.includes('TOKEN') && !key.includes('KEY') && !key.includes('SECRET')));
  console.log('=== DATABASE DEBUG END ===');

  // Return a safe summary (no sensitive data)
  const dbSummary: any = {
    nodeEnv: process.env.NODE_ENV,
    dbConfigured: !!(
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING
    ),
    totalEnvVars: Object.keys(process.env).length,
    sampleNonSensitive: Object.keys(process.env).filter(key => key.startsWith('NEXT_')).slice(0, 3), // Example non-sensitive keys
    timestamp: new Date().toISOString(),
    tests: {} as any
  };

  try {
    // Test 1: Database configuration validation
    dbSummary.tests.configTest = {
      success: dbSummary.dbConfigured,
      message: dbSummary.dbConfigured
        ? `Database connection string configured`
        : 'No database connection string found'
    }

    if (!dbSummary.dbConfigured) {
      return res.status(400).json({
        ...dbSummary,
        error: 'Database not configured',
        recommendations: [
          'Add POSTGRES_URL to environment variables in Vercel dashboard',
          'Or create a Postgres database in Vercel Storage tab'
        ]
      })
    }

    // Test 2: Database connection
    try {
      const isConnected = await quizQuestionDB.testConnection();
      dbSummary.tests.connectionTest = {
        success: isConnected,
        message: isConnected ? 'Successfully connected to database' : 'Failed to connect to database'
      }

      if (!isConnected) {
        return res.status(500).json({
          ...dbSummary,
          error: 'Database connection failed',
          recommendations: [
            'Check your POSTGRES_URL is correct',
            'Ensure database is running in Vercel',
            'Verify database permissions'
          ]
        })
      }
    } catch (error: any) {
      dbSummary.tests.connectionTest = {
        success: false,
        message: 'Connection test failed',
        error: error.message
      }
    }

    // Test 3: Query operation (only if connection succeeded)
    if (dbSummary.tests.connectionTest.success) {
      try {
        const questions = await quizQuestionDB.getAllQuestions();
        dbSummary.tests.queryTest = {
          success: true,
          message: `Successfully queried ${questions.length} questions`,
          details: {
            questionCount: questions.length,
            sampleData: questions.slice(0, 2).map(q => ({
              id: q.id,
              question: q.question_text.substring(0, 50) + '...',
              answerCount: q.answers.length
            }))
          }
        }
      } catch (error: any) {
        dbSummary.tests.queryTest = {
          success: false,
          message: 'Query operation failed',
          error: error.message
        }
      }
    }

    // Test 4: Insert operation (only if query succeeded)
    if (dbSummary.tests.queryTest?.success) {
      try {
        const testQuestion = {
          question_text: 'Database connection test question',
          answers: [
            { answer_text: 'Test Answer 1', is_correct: false },
            { answer_text: 'Test Answer 2', is_correct: true }
          ]
        };

        const createdQuestion = await quizQuestionDB.createQuestion(
          testQuestion.question_text,
          testQuestion.answers
        );

        dbSummary.tests.insertTest = {
          success: true,
          message: 'Successfully created test question',
          details: {
            questionId: createdQuestion.id,
            answerCount: createdQuestion.answers.length
          }
        }

        // Clean up - delete the test question
        try {
          await quizQuestionDB.deleteQuestion(createdQuestion.id);
          dbSummary.tests.cleanupTest = {
            success: true,
            message: 'Successfully cleaned up test question'
          }
        } catch (cleanupError) {
          dbSummary.tests.cleanupTest = {
            success: false,
            message: 'Failed to cleanup test question',
            error: (cleanupError as Error).message
          }
        }

      } catch (error: any) {
        dbSummary.tests.insertTest = {
          success: false,
          message: 'Insert operation failed',
          error: error.message
        }
      }
    }

    // Generate recommendations
    const recommendations = []
    if (!dbSummary.dbConfigured) {
      recommendations.push('Create a Postgres database in Vercel dashboard')
      recommendations.push('Add POSTGRES_URL to environment variables')
    }
    if (!dbSummary.tests.connectionTest?.success) {
      recommendations.push('Check database connection string')
      recommendations.push('Ensure database is running and accessible')
    }
    if (!dbSummary.tests.queryTest?.success) {
      if (dbSummary.tests.queryTest?.error?.includes('permission')) {
        recommendations.push('Check database user permissions')
        recommendations.push('Ensure user has SELECT permissions')
      }
      if (dbSummary.tests.queryTest?.error?.includes('does not exist')) {
        recommendations.push('Run database schema migration')
        recommendations.push('Create quiz_questions and question_answers tables')
      }
    }
    if (!dbSummary.tests.insertTest?.success && dbSummary.tests.queryTest?.success) {
      recommendations.push('Check database INSERT permissions')
      recommendations.push('Ensure user has write permissions')
    }

    dbSummary.recommendations = recommendations

    return res.status(200).json(dbSummary)

  } catch (error: any) {
    console.error('Database debug API error:', error)
    return res.status(500).json({
      ...dbSummary,
      error: 'Internal server error during database debug',
      details: error.message
    })
  }
}