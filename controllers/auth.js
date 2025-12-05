// controllers/auth.js
//
// Controller functions for user authentication and registration. Users
// may register with email/password or sign in via Google OAuth. Upon
// successful authentication a JWT is generated and returned along with
// minimal user information. Passwords are hashed using bcrypt.

// Local email/password authentication has been removed. We no longer
// require bcrypt since passwords are not stored or verified. Authentication
// will be performed exclusively via Google OAuth.

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');

/*
 * Google OAuth configuration
 *
 * Instead of supporting local email/password authentication, this API
 * relies entirely on Google OAuth to authenticate users. In order to
 * complete the OAuth flow the API must be configured with a client
 * ID, client secret and a redirect URI. These values should be
 * provided via environment variables:
 *
 *   GOOGLE_CLIENT_ID     – the OAuth 2.0 client ID issued by Google
 *   GOOGLE_CLIENT_SECRET – the OAuth 2.0 client secret issued by Google
 *   GOOGLE_REDIRECT_URI  – the URL registered with Google to receive
 *                          the authorization code (e.g. https://your-domain.com/api/auth/google/callback)
 */

const googleClientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// Instantiate a single OAuth2Client. It can both generate authorization
// URLs and exchange authorization codes for tokens. It will also be
// used to verify idTokens returned by Google. If the client secret
// or redirect URI are not supplied the OAuth flow will fail.
const googleAuthClient = new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri);

/**
 * Helper to generate a JWT for an authenticated user. The token
 * contains the user id and role and expires according to the
 * JWT_EXPIRES_IN environment variable (default 7 days).
 *
 * @param {Object} user Mongoose user document
 * @returns {String} signed JWT
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'please-change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
}

// The register() and login() functions have been removed. Local
// authentication with email/password is no longer supported.

/**
 * Authenticate a user via Google OAuth. Expects a Google idToken in
 * the request body. The id token is verified against the configured
 * Google client ID. On success a new user is created if one does not
 * already exist. Returns a JWT and minimal user info.
 */
async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: true, message: 'idToken is required' });
    }
    // verify using the configured OAuth client. This client includes the
    // client ID, secret and redirect URI. Only the client ID is needed
    // for verification.
    const ticket = await googleAuthClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    const authId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Google User';
    const picture = payload.picture;
    let user = await User.findOne({ authProvider: 'google', authId });
    if (!user) {
      user = new User({
        authProvider: 'google',
        authId,
        email,
        name,
        avatarUrl: picture,
        role: 'user',
      });
      await user.save();
    }
    const token = generateToken(user);
    const userInfo = { id: user._id, email: user.email, name: user.name, role: user.role };
    return res.status(200).json({ token, user: userInfo });
  } catch (err) {
    console.error('auth.google error:', err);
    return res.status(401).json({ error: true, message: 'Invalid Google id token' });
  }
}

/**
 * Generate a Google OAuth consent URL. Clients can use this endpoint to
 * retrieve the URL to which a user should be redirected in order to
 * initiate the OAuth flow.
 */
function getGoogleAuthUrl(req, res) {
  try {
    const url = googleAuthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
    });
    return res.status(200).json({ url });
  } catch (err) {
    console.error('auth.getGoogleAuthUrl error:', err);
    return res.status(500).json({ error: true, message: 'Failed to generate OAuth URL' });
  }
}

/**
 * Handle the OAuth callback from Google. Exchanges the authorization
 * code for tokens, verifies the idToken, and creates or updates the
 * user in the database. Returns both the idToken (from Google) and
 * a JWT issued by this API.
 */
async function googleCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: true, message: 'code is required' });
    }
    // Exchange the authorization code for tokens
    const { tokens } = await googleAuthClient.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      return res.status(401).json({ error: true, message: 'Failed to obtain idToken from Google' });
    }
    // Verify the idToken and extract user information
    const ticket = await googleAuthClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    const authId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Google User';
    const picture = payload.picture;
    // Find or create user
    let user = await User.findOne({ authProvider: 'google', authId });
    if (!user) {
      user = new User({
        authProvider: 'google',
        authId,
        email,
        name,
        avatarUrl: picture,
        role: 'user',
      });
      await user.save();
    } else {
      // Update user fields if changed
      let updated = false;
      if (user.email !== email) { user.email = email; updated = true; }
      if (user.name !== name) { user.name = name; updated = true; }
      if (user.avatarUrl !== picture) { user.avatarUrl = picture; updated = true; }
      if (updated) { await user.save(); }
    }
    const token = generateToken(user);
    const userInfo = { id: user._id, email: user.email, name: user.name, role: user.role };
    return res.status(200).json({ idToken, token, user: userInfo });
  } catch (err) {
    console.error('auth.googleCallback error:', err);
    return next(err);
  }
}

/**
 * Logout endpoint. Since JWTs are stateless we cannot truly invalidate
 * a token on the server. The client should remove its copy. This
 * endpoint simply returns a success message.
 */
async function logout(req, res) {
  return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  // Local registration and login are intentionally omitted. Only Google OAuth is supported.
  googleAuth,
  logout,
  getGoogleAuthUrl,
  googleCallback,
};