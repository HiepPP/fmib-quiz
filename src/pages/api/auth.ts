import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Simple JWT-like token implementation
const createToken = (payload: any, expiresIn: string = '24h'): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const expiration = now + (24 * 60 * 60); // 24 hours from now

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: expiration
  };

  // Create a simple token by encoding the header and payload
  // In production, you would use a proper JWT library with proper signing
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = Buffer.from(uuidv4()).toString('base64url').slice(0, 43);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Verify token (simple implementation)
const verifyToken = (token: string): any => {
  try {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return null;
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Check hardcoded credentials
    if (username === 'admin' && password === 'admin') {
      // Create user object
      const user = {
        id: 1,
        username: 'admin',
        name: 'Administrator',
        role: 'admin'
      };

      // Generate token
      const token = createToken(user);

      // Return success response with token and user info
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
    } else {
      // Invalid credentials
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Export for potential use in other API routes
export { verifyToken };