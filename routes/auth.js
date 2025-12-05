// routes/auth.js
//
// Authentication routes. Local email/password endpoints have been removed; authentication is
// handled exclusively via Google OAuth.

const router = require('express').Router();
const authController = require('../controllers/auth');

// Generate the Google OAuth authorization URL. Clients should call this
// endpoint to obtain the URL to redirect users for Google login.
router.get('/google/url', authController.getGoogleAuthUrl);

// Google OAuth authentication. Accepts an idToken obtained by the client and
// returns a JWT. This is optional if you use the full OAuth redirect flow.
router.post('/google', authController.googleAuth);

// OAuth callback. Google will redirect the user here with a `code`
// query parameter after they grant consent. This endpoint exchanges the
// code for tokens and returns both the Google idToken and a JWT.
router.get('/google/callback', authController.googleCallback);

// Logout (stateless, informs client to discard its token)
router.post('/logout', authController.logout);

module.exports = router;