/**
 * Vercel Blob Storage Debugging Tools
 *
 * This file contains utilities to help debug blob storage issues
 */

import { put, list, head } from '@vercel/blob';
import { checkBlobStorageConfig } from './dev-storage';

export interface DebugInfo {
  timestamp: string;
  environment: string;
  hasToken: boolean;
  tokenLength?: number;
  tokenPrefix?: string;
  configuration: {
    isConfigured: boolean;
    message: string;
    canProceed: boolean;
  };
  tests: {
    tokenValidation: TestResult;
    listTest: TestResult;
    putTest: TestResult;
    headTest: TestResult;
  };
  recommendations: string[];
}

export interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  details?: any;
}

/**
 * Comprehensive blob storage debugging function
 */
export async function debugBlobStorage(): Promise<DebugInfo> {
  const timestamp = new Date().toISOString();
  const environment = process.env.NODE_ENV || 'unknown';
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';

  const debugInfo: DebugInfo = {
    timestamp,
    environment,
    hasToken,
    tokenLength: hasToken ? token.length : 0,
    tokenPrefix: hasToken ? token.substring(0, 10) + '...' : 'none',
    configuration: checkBlobStorageConfig(),
    tests: {
      tokenValidation: { success: false, message: 'Not tested' },
      listTest: { success: false, message: 'Not tested' },
      putTest: { success: false, message: 'Not tested' },
      headTest: { success: false, message: 'Not tested' }
    },
    recommendations: []
  };

  console.log('🔍 Starting Vercel Blob Storage Debug...');
  console.log(`📍 Environment: ${environment}`);
  console.log(`🔑 Token Present: ${hasToken}`);
  console.log(`📏 Token Length: ${debugInfo.tokenLength}`);

  // Test 1: Token Validation
  debugInfo.tests.tokenValidation = await testTokenValidation();

  // Test 2: List Blobs
  debugInfo.tests.listTest = await testListOperation();

  // Test 3: Put Operation (only if list test passed)
  if (debugInfo.tests.listTest.success) {
    debugInfo.tests.putTest = await testPutOperation();
  } else {
    debugInfo.tests.putTest = {
      success: false,
      message: 'Skipped due to list test failure',
      error: debugInfo.tests.listTest.error
    };
  }

  // Test 4: Head Operation (if we have blobs)
  if (debugInfo.tests.listTest.success) {
    debugInfo.tests.headTest = await testHeadOperation();
  } else {
    debugInfo.tests.headTest = {
      success: false,
      message: 'Skipped due to list test failure',
      error: debugInfo.tests.listTest.error
    };
  }

  // Generate recommendations
  debugInfo.recommendations = generateRecommendations(debugInfo);

  // Log detailed results
  console.log('\n📊 Debug Results:');
  console.table(debugInfo.tests);

  if (debugInfo.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    debugInfo.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  return debugInfo;
}

/**
 * Test token validation
 */
async function testTokenValidation(): Promise<TestResult> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return {
        success: false,
        message: 'BLOB_READ_WRITE_TOKEN not found in environment variables',
        error: 'Missing environment variable'
      };
    }

    if (token.length < 10) {
      return {
        success: false,
        message: 'Token appears to be too short',
        error: 'Invalid token format',
        details: { tokenLength: token.length }
      };
    }

    // Basic token format validation
    const validFormats = [
      /^blob_[a-zA-Z0-9]+$/,  // Vercel blob tokens usually start with 'blob_'
      /^vercel_blob_rw_[a-zA-Z0-9]+$/,
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/  // UUID format
    ];

    const isValidFormat = validFormats.some(regex => regex.test(token));

    if (!isValidFormat) {
      return {
        success: false,
        message: 'Token format does not match expected Vercel blob token patterns',
        error: 'Invalid token format',
        details: {
          tokenPrefix: token.substring(0, Math.min(20, token.length)),
          expectedFormats: ['blob_*', 'vercel_blob_rw_*', 'UUID format']
        }
      };
    }

    return {
      success: true,
      message: 'Token appears to be valid',
      details: { tokenLength: token.length, tokenPrefix: token.substring(0, 10) + '...' }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Error validating token',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test list operation
 */
async function testListOperation(): Promise<TestResult> {
  try {
    console.log('🔍 Testing list operation...');
    const result = await list();

    return {
      success: true,
      message: `Successfully listed ${result.blobs.length} blobs`,
      details: {
        blobCount: result.blobs.length,
        blobUrls: result.blobs.map(b => b.pathname),
        hasPermissions: true
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    let helpfulError = errorMessage;
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      helpfulError = 'Permission denied - check your BLOB_READ_WRITE_TOKEN';
    } else if (errorMessage.includes('404')) {
      helpfulError = 'Blob store not found - ensure you created a blob store in Vercel';
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch')) {
      helpfulError = 'Network error - check your internet connection';
    }

    return {
      success: false,
      message: helpfulError,
      error: errorMessage,
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        probableCause: getProbableCause(errorMessage)
      }
    };
  }
}

/**
 * Test put operation
 */
async function testPutOperation(): Promise<TestResult> {
  try {
    console.log('📝 Testing put operation...');

    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'This is a test file for debugging blob storage'
    };

    const blob = await put('debug-test.json', JSON.stringify(testData, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });

    // Test if we can read it back
    const response = await fetch(blob.url);
    const readBack = await response.json();

    const success = readBack.test === true && readBack.timestamp === testData.timestamp;

    return {
      success,
      message: success ? 'Successfully wrote and read back test data' : 'Write succeeded but read back failed',
      details: {
        uploadUrl: blob.url,
        uploadedAt: blob.uploadedAt,
        readBackSuccess: success,
        testData: testData,
        readBackData: success ? readBack : 'Failed to read'
      }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Put operation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    };
  }
}

/**
 * Test head operation
 */
async function testHeadOperation(): Promise<TestResult> {
  try {
    console.log('🔍 Testing head operation...');

    const { blobs } = await list();

    if (blobs.length === 0) {
      return {
        success: true,
        message: 'No blobs to test head operation (this is normal)',
        details: { blobCount: 0 }
      };
    }

    // Test head on first blob
    const firstBlob = blobs[0];
    const headResult = await head(firstBlob.url);

    return {
      success: true,
      message: 'Successfully performed head operation',
      details: {
        testedBlob: firstBlob.pathname,
        contentType: headResult.contentType,
        size: headResult.size,
        uploadedAt: headResult.uploadedAt
      }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Head operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Determine probable cause of error
 */
function getProbableCause(errorMessage: string): string {
  if (errorMessage.includes('401') || errorMessage.includes('403')) {
    return 'Invalid or insufficient permissions';
  }
  if (errorMessage.includes('404')) {
    return 'Blob store not created or deleted';
  }
  if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch')) {
    return 'Network connectivity issue';
  }
  if (errorMessage.includes('CORS')) {
    return 'CORS configuration issue';
  }
  return 'Unknown - check Vercel dashboard for blob store status';
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(debugInfo: DebugInfo): string[] {
  const recommendations: string[] = [];

  if (!debugInfo.hasToken) {
    recommendations.push('Add BLOB_READ_WRITE_TOKEN to your environment variables');
    recommendations.push('Get the token from Vercel dashboard → Storage → Your Blob Store');
  }

  if (!debugInfo.tests.tokenValidation.success) {
    recommendations.push('Verify your BLOB_READ_WRITE_TOKEN is correct and complete');
    recommendations.push('Ensure you copied the entire token without extra spaces');
  }

  if (!debugInfo.tests.listTest.success) {
    if (debugInfo.tests.listTest.error?.includes('401') || debugInfo.tests.listTest.error?.includes('403')) {
      recommendations.push('Check that your token has read/write permissions');
      recommendations.push('Regenerate the token in Vercel dashboard if needed');
    }
    if (debugInfo.tests.listTest.error?.includes('404')) {
      recommendations.push('Create a blob store in your Vercel project dashboard');
      recommendations.push('Ensure the blob store is in the same project as your app');
    }
  }

  if (debugInfo.tests.putTest.success && !debugInfo.tests.headTest.success) {
    recommendations.push('Put operation works but there may be read permission issues');
  }

  if (debugInfo.environment === 'development' && !debugInfo.hasToken) {
    recommendations.push('For local development, you can continue without blob storage (localStorage fallback)');
    recommendations.push('Add the token to .env.local for full functionality');
  }

  if (debugInfo.environment === 'production' && !debugInfo.hasToken) {
    recommendations.push('⚠️ PRODUCTION: You must add BLOB_READ_WRITE_TOKEN environment variable');
    recommendations.push('Set this in Vercel dashboard → Settings → Environment Variables');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Everything looks good! Your blob storage is properly configured');
  }

  return recommendations;
}

/**
 * Quick health check for blob storage
 */
export async function quickHealthCheck(): Promise<{ healthy: boolean; message: string }> {
  try {
    const { blobs } = await list();
    return {
      healthy: true,
      message: `✅ Blob storage is healthy (${blobs.length} blobs found)`
    };
  } catch (error) {
    return {
      healthy: false,
      message: `❌ Blob storage error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Console logging utility for debugging
 */
export function logDebugInfo(debugInfo: DebugInfo): void {
  console.group('🔍 Vercel Blob Storage Debug Report');
  console.log('Timestamp:', debugInfo.timestamp);
  console.log('Environment:', debugInfo.environment);
  console.log('Token Present:', debugInfo.hasToken);
  console.log('Token Length:', debugInfo.tokenLength);

  console.group('Test Results');
  Object.entries(debugInfo.tests).forEach(([testName, result]) => {
    console.log(`${testName}: ${result.success ? '✅' : '❌'} ${result.message}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  console.groupEnd();

  if (debugInfo.recommendations.length > 0) {
    console.group('Recommendations');
    debugInfo.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
}