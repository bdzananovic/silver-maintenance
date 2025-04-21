require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');

const app = express();

// Ditat route
const ditatRoutes = require('./routes/ditat');

// Serve public folder for JS/CSS (like config.js)
app.use(express.static(path.join(__dirname, 'public')));

// Serve views and images
app.use(express.static(path.join(__dirname, 'views')));
app.use('/images', express.static(path.join(__dirname, 'views/images')));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  if (profile._json.hd !== "silvertruckingllc.com") {
    return done(null, false, { message: "Not a company email" });
  }
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Log available HTML views for reference
console.log('📁 Available HTML views:', fs.readdirSync(path.join(__dirname, 'views')));

// Ditat API routes
app.use('/api/ditat', ditatRoutes);

// Auth-protected dashboard
app.use('/dashboard.html', (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  next();
});

// Auth-protected units page
app.get('/units.html', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'views', 'units.html'));
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => res.redirect('/dashboard.html')
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/logout.html');
  });
});

// ✅ Test route for unit data
app.get('/api/units', (req, res) => {
  res.json([
    { TruckId: '123', status: 'Active' },
    { TruckId: '456', status: 'Inactive' }
  ]);
});

// ✅ Start the server
app.listen(3000, () => {
  console.log('✅ App is running on http://localhost:3000');
});
