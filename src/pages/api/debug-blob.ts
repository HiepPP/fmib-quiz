import type { NextApiRequest, NextApiResponse } from 'next'
import { put, list } from '@vercel/blob'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Log to Vercel function logs (visible in dashboard)
  console.log('=== ENV DEBUG START ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('BLOB_READ_WRITE_TOKEN present:', !!process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.length > 0 ? 'YES' : 'NO (EMPTY OR MISSING)');
  console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN ? process.env.BLOB_READ_WRITE_TOKEN.length : 0); // Length only, not value
  console.log('All env keys (non-sensitive):', Object.keys(process.env).filter(key => !key.includes('TOKEN') && !key.includes('KEY') && !key.includes('SECRET')));
  console.log('=== ENV DEBUG END ===');

  // Return a safe summary (no sensitive data)
  const envSummary: any = {
    nodeEnv: process.env.NODE_ENV,
    blobTokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.length > 0,
    totalEnvVars: Object.keys(process.env).length,
    sampleNonSensitive: Object.keys(process.env).filter(key => key.startsWith('NEXT_')).slice(0, 3), // Example non-sensitive keys
    timestamp: new Date().toISOString(),
    tests: {} as any
  };

  try {
    // Test 1: Token validation
    envSummary.tests.tokenValidation = {
      success: envSummary.blobTokenPresent,
      message: envSummary.blobTokenPresent
        ? `Token present and properly configured`
        : 'Token missing or empty'
    }

    if (!envSummary.blobTokenPresent) {
      return res.status(400).json({
        ...envSummary,
        error: 'BLOB_READ_WRITE_TOKEN not configured',
        recommendations: ['Add BLOB_READ_WRITE_TOKEN to environment variables in Vercel dashboard']
      })
    }

    // Test 2: List operation
    try {
      const result = await list()
      envSummary.tests.listTest = {
        success: true,
        message: `Successfully listed ${result.blobs.length} blobs`,
        details: {
          blobCount: result.blobs.length,
          blobNames: result.blobs.map(b => b.pathname)
        }
      }
    } catch (error: any) {
      envSummary.tests.listTest = {
        success: false,
        message: 'List operation failed',
        error: error.message
      }
    }

    // Test 3: Put operation (only if list succeeded)
    if (envSummary.tests.listTest.success) {
      try {
        const testData = { test: true, timestamp: new Date().toISOString() }
        const blob = await put('debug-test.json', JSON.stringify(testData), {
          access: 'public',
          contentType: 'application/json'
        })

        envSummary.tests.putTest = {
          success: true,
          message: 'Successfully created test file',
          details: {
            url: blob.url,
            uploadedAt: new Date().toISOString()
          }
        }

        // Clean up - delete the test file
        try {
          const { del } = await import('@vercel/blob')
          await del(blob.url)
          envSummary.tests.cleanupTest = {
            success: true,
            message: 'Successfully cleaned up test file'
          }
        } catch (cleanupError) {
          envSummary.tests.cleanupTest = {
            success: false,
            message: 'Failed to cleanup test file',
            error: (cleanupError as Error).message
          }
        }

      } catch (error: any) {
        envSummary.tests.putTest = {
          success: false,
          message: 'Put operation failed',
          error: error.message
        }
      }
    }

    // Generate recommendations
    const recommendations = []
    if (!envSummary.blobTokenPresent) {
      recommendations.push('Add BLOB_READ_WRITE_TOKEN to environment variables')
    }
    if (!envSummary.tests.listTest.success) {
      if (envSummary.tests.listTest.error?.includes('401') || envSummary.tests.listTest.error?.includes('403')) {
        recommendations.push('Check your BLOB_READ_WRITE_TOKEN permissions')
        recommendations.push('Regenerate the token in Vercel dashboard')
      }
      if (envSummary.tests.listTest.error?.includes('404')) {
        recommendations.push('Create a blob store in Vercel dashboard')
      }
    }
    if (!envSummary.tests.putTest.success && envSummary.tests.listTest.success) {
      recommendations.push('Check write permissions for your blob store')
    }

    envSummary.recommendations = recommendations

    return res.status(200).json(envSummary)

  } catch (error: any) {
    console.error('Debug API error:', error)
    return res.status(500).json({
      ...envSummary,
      error: 'Internal server error during debug',
      details: error.message
    })
  }
}