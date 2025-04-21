require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// Routers
const ditatRoutes = require('./routes/ditat');
const uploadRouter = require('./routes/upload');
const unitsRouter = require('./routes/units');

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/images', express.static(path.join(__dirname, 'views/images')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// JSON body parser
app.use(bodyParser.json());

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://silver-maintenance-production.up.railway.app/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  if (profile._json.hd !== "silvertruckingllc.com") {
    return done(null, false, { message: "Not a company email" });
  }
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Console log views folder for reference
console.log('📁 Available HTML views:', fs.readdirSync(path.join(__dirname, 'views')));

// API Routes
app.use('/api/ditat', ditatRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/units', unitsRouter);

// Auth-protected pages
app.get('/dashboard.html', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});


app.get('/units.html', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'views', 'units.html'));
});

// Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => res.redirect('/dashboard.html')
);

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/logout.html');
  });
});

// Smart root redirect
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.redirect('/dashboard.html');
});

// Server (Updated for Railway)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ App is running on http://localhost:${PORT}`);
});
