# Deployment Guide: Render

This guide walks through deploying the Event Ticket Booking System on Render.

## Prerequisites

1. **Git repository** — Push the code to GitHub/GitLab.
2. **MongoDB Atlas cluster** — Create a free cluster at https://www.mongodb.com/cloud/atlas
   - Use the "Replica Set" connection string (recommended for transactions)
3. **Render account** — Sign up at https://render.com

## Step 1: Get MongoDB Connection String

1. Log into **MongoDB Atlas** → **Clusters** → **Connect** → **Drivers**
2. Copy the connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/ticket-booking?retryWrites=true&w=majority`)
3. **Save it** — you'll use it in Step 3.

## Step 2: Deploy via Render Blueprint

1. Log into **Render** → Click **New** → **Blueprint**
2. Connect your GitHub/GitLab repo
3. Render reads `render.yaml` and creates two services:
   - `ticketflow-backend` (Node API)
   - `ticketflow-frontend` (React static site)
4. Click **Create Blueprint**

Render will start deploying. When both services show **"Live"**, note their URLs:
- Backend: e.g. `https://ticketflow-backend.onrender.com`
- Frontend: e.g. `https://ticketflow-frontend.onrender.com`

## Step 3: Wire Services Together

Go to the Render Dashboard and set environment variables (marked `sync: false` in `render.yaml`):

### Backend (`ticketflow-backend`) — Environment tab:
- **`MONGODB_URI`** = your MongoDB Atlas connection string (from Step 1)
- Click **Save Changes** → Render auto-redeploys

Wait ~30s for the backend to restart.

### Frontend (`ticketflow-frontend`) — Environment tab:
- **`REACT_APP_API_URL`** = `https://ticketflow-backend.onrender.com/api` (your backend URL + `/api`)
- Click **Save Changes** → Render rebuilds and redeploys

Wait for the build to complete (2–3 minutes).

## Step 4: Seed the Database

After the backend is live and connected to MongoDB:

1. Go to **ticketflow-backend** → **Shell** (tab at the top)
2. Run:
   ```bash
   npm run seed
   ```
3. You should see: `Created event "Rock Night Live" with 40 seats` (and 3 more events)
4. The database is now populated.

## Step 5: Test the App

Open the frontend URL in your browser: `https://ticketflow-frontend.onrender.com`

You should see:
- The hero section with live stats
- 4 upcoming events
- Ability to register, select seats, reserve, and book

## Troubleshooting

### Backend shows "ERROR" status
- Check `ticketflow-backend` → **Logs** for error details
- Most common: wrong `MONGODB_URI` or missing `CLIENT_ORIGIN`
- Fix the env var and redeploy

### Frontend shows 404 or blank page
- Clear your browser cache (Ctrl+Shift+Delete)
- Check `ticketflow-frontend` → **Logs**
- Ensure `REACT_APP_API_URL` is set correctly

### "Cannot connect to API" errors
- Verify `REACT_APP_API_URL` matches your backend URL + `/api`
- Verify `CLIENT_ORIGIN` on the backend matches your frontend URL (no trailing slash)
- Wait ~60s after redeploy for services to fully wake up (Render free tier cold-starts)

### Seed doesn't run / no events appear
- Ensure backend is fully live (check status is "Live", not "Starting")
- Verify `MONGODB_URI` is correct by checking logs
- Run seed again from the Shell

## Notes

- **Free tier cold starts**: Render's free web services sleep after 15 minutes of inactivity. The first request after idle takes 30–60s to wake. Upgrade to **Starter** (~$7/month) for instant responses.
- **Database**: MongoDB Atlas free tier is generous (512 MB storage, unlimited connections) — sufficient for testing.
- **Custom domain**: Render lets you add a custom domain for $10/month.

## After Deployment

The app is now live and accessible worldwide at `https://ticketflow-frontend.onrender.com`. Share the link!

### For further development:
- Push new code to your repo. Render auto-redeploys on `git push`.
- Use Render's **Logs** and **Metrics** tabs for monitoring.
