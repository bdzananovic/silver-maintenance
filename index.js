require('dotenv').config();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default; // ✅ Updated to use modern syntax
const Redis = require('ioredis');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Initialize Redis Client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

// Import Routers
const ditatRoutes = require('./routes/ditat');
const uploadTrucksRouter = require('./routes/upload-trucks');
const uploadTrailersRouter = require('./routes/upload-trailers');
const unitsRouter = require('./routes/units');

// Debug: Log router exports for validation
console.log('🧪 Router Exports:', {
  ditatRoutes: typeof ditatRoutes,
  uploadTrucksRouter: typeof uploadTrucksRouter,
  uploadTrailersRouter: typeof uploadTrailersRouter,
  unitsRouter: typeof unitsRouter,
});

// Apply Middleware
app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Use Redis for Session Storage (with updated RedisStore syntax)
const store = new RedisStore({ client: redisClient });

app.use(session({
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
  if (profile._json.hd !== "silvertruckingllc.com") {
    return done(null, false, { message: "Not a company email" });
  }
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Debug: Log available views
console.log('📁 Available HTML Views:', fs.readdirSync(path.join(__dirname, 'views')));

// API Routes
app.use('/api/ditat', ditatRoutes);
app.use('/api/upload/trucks', uploadTrucksRouter);
app.use('/api/upload/trailers', uploadTrailersRouter);
app.use('/api/units', unitsRouter);

// Protected HTML Routes
const protectedRoutes = [
  { path: '/dashboard.html', view: 'dashboard.html' },
  { path: '/units.html', view: 'units.html' },
  { path: '/schedules.html', view: 'schedules.html' },
];

protectedRoutes.forEach(route => {
  app.get(route.path, (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'views', route.view));
  });
});

// OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => res.redirect('/dashboard.html')
);

// Logout Route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/logout.html');
  });
});

// Root Route
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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ App is running on http://localhost:${PORT}`);
});
