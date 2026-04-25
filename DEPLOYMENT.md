# Deployment Guide: Taraba APC Campaign App

## 1. Full-Stack Deployment (Express + React)
This application is built as a unified full-stack application using Express.js and React.

1. **Host on Platform with Node.js Support** (e.g., Render, Heroku, Railway).
2. **Setup**:
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js` (Note: In the AI Studio environment, we use `tsx server.ts` for development).
3. **Environment Variables**:
   - `JWT_SECRET`: A secure random string for token encryption.
   - `GEMINI_API_KEY`: API key for strategic intelligence features.
   - `NODE_ENV`: Set to `production`.
   - `PORT`: 3000.

## 2. Persistent Storage
- The current implementation uses `database.json` for lightweight persistence.
- For production scaling, consider migrating the data layer in `server.ts` to a PostgreSQL or MongoDB database.

---

# Testing Instructions
1. **Registration**: Go to the Auth page, select 'Create Account', fill the Jalingo/Yorro/Zing wards, and submit.
2. **Admin Flow**: Login as the designated Admin (admin@campaign.gov / admin123). Go to 'Members' and approve the new user.
3. **Messaging**: As Admin, send an 'All' broadcast. Verify it appears in the sent history and list.
4. **Events**: Create a rally in 'Turaki A' ward. Check if it appears in the events grid.
5. **Feedback**: As a Supporter, send a suggestion. As Admin, reply to it.
6. **Videos**: Upload a campaign video in the Media Center and verify uplink status.
