import type { NextApiRequest, NextApiResponse } from 'next'
import { put, list, head } from '@vercel/blob'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) || 'none',
    tests: {} as any
  }

  try {
    // Test 1: Token validation
    debugInfo.tests.tokenValidation = {
      success: debugInfo.hasToken && debugInfo.tokenLength > 20,
      message: debugInfo.hasToken
        ? `Token present (${debugInfo.tokenLength} chars)`
        : 'Token missing'
    }

    if (!debugInfo.hasToken) {
      return res.status(400).json({
        ...debugInfo,
        error: 'BLOB_READ_WRITE_TOKEN not configured',
        recommendations: ['Add BLOB_READ_WRITE_TOKEN to environment variables']
      })
    }

    // Test 2: List operation
    try {
      const result = await list()
      debugInfo.tests.listTest = {
        success: true,
        message: `Successfully listed ${result.blobs.length} blobs`,
        details: {
          blobCount: result.blobs.length,
          blobNames: result.blobs.map(b => b.pathname)
        }
      }
    } catch (error: any) {
      debugInfo.tests.listTest = {
        success: false,
        message: 'List operation failed',
        error: error.message
      }
    }

    // Test 3: Put operation (only if list succeeded)
    if (debugInfo.tests.listTest.success) {
      try {
        const testData = { test: true, timestamp: new Date().toISOString() }
        const blob = await put('debug-test.json', JSON.stringify(testData), {
          access: 'public',
          contentType: 'application/json'
        })

        debugInfo.tests.putTest = {
          success: true,
          message: 'Successfully created test file',
          details: {
            url: blob.url,
            uploadedAt: blob.uploadedAt
          }
        }

        // Clean up - delete the test file
        try {
          const { del } = await import('@vercel/blob')
          await del(blob.url)
          debugInfo.tests.cleanupTest = {
            success: true,
            message: 'Successfully cleaned up test file'
          }
        } catch (cleanupError) {
          debugInfo.tests.cleanupTest = {
            success: false,
            message: 'Failed to cleanup test file',
            error: (cleanupError as Error).message
          }
        }

      } catch (error: any) {
        debugInfo.tests.putTest = {
          success: false,
          message: 'Put operation failed',
          error: error.message
        }
      }
    }

    // Generate recommendations
    const recommendations = []
    if (!debugInfo.hasToken) {
      recommendations.push('Add BLOB_READ_WRITE_TOKEN to environment variables')
    }
    if (!debugInfo.tests.listTest.success) {
      if (debugInfo.tests.listTest.error?.includes('401') || debugInfo.tests.listTest.error?.includes('403')) {
        recommendations.push('Check your BLOB_READ_WRITE_TOKEN permissions')
        recommendations.push('Regenerate the token in Vercel dashboard')
      }
      if (debugInfo.tests.listTest.error?.includes('404')) {
        recommendations.push('Create a blob store in Vercel dashboard')
      }
    }
    if (!debugInfo.tests.putTest.success && debugInfo.tests.listTest.success) {
      recommendations.push('Check write permissions for your blob store')
    }

    debugInfo.recommendations = recommendations

    return res.status(200).json(debugInfo)

  } catch (error: any) {
    console.error('Debug API error:', error)
    return res.status(500).json({
      ...debugInfo,
      error: 'Internal server error during debug',
      details: error.message
    })
  }
}