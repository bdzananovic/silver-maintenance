require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Routers
const ditatRoutes = require('./routes/ditat');
const uploadTrucksRouter = require('./routes/uploadTrucks');
const uploadTrailersRouter = require('./routes/uploadTrailers');
const unitsRouter = require('./routes/units');

// Debug: check exports
console.log('🧪 typeof ditatRoutes:', typeof ditatRoutes);
console.log('🧪 typeof uploadTrucksRouter:', typeof uploadTrucksRouter);
console.log('🧪 typeof uploadTrailersRouter:', typeof uploadTrailersRouter);
console.log('🧪 typeof unitsRouter:', typeof unitsRouter);

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/images', express.static(path.join(__dirname, 'views/images')));
app.use(bodyParser.json({ limit: '10mb' }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

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

// Log views for debug
console.log('📁 Available HTML views:', fs.readdirSync(path.join(__dirname, 'views')));

// API Routes
app.use('/api/ditat', ditatRoutes);
app.use('/api/upload/trucks', uploadTrucksRouter);
app.use('/api/upload/trailers', uploadTrailersRouter);
app.use('/api/units', unitsRouter);

// Protected Routes
app.get('/dashboard.html', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/units.html', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'views', 'units.html'));
});

app.get('/schedules.html', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'views', 'schedules.html'));
});

// OAuth Routes
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

// Root
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login.html');
  res.redirect('/dashboard.html');
});

// 404 Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).send('Something went wrong!');
});

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ App is running on http://localhost:${PORT}`);
});
