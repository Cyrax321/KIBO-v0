# Deployment Guide

This guide details how to deploy **Kibo** to production using [Vercel](https://vercel.com), our recommended hosting provider for React/Vite applications.

## 1. Prerequisites

*   A [GitHub account](https://github.com) with the [Kibo repository](https://github.com/Cyrax321/KIBO-v0) pushed.
*   A [Vercel account](https://vercel.com/signup).
*   Your Supabase project URL and Anon Key.

## 2. Deploy to Vercel

1.  **Login to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import Git Repository:**
    *   Select your GitHub account.
    *   Find `KIBO-v0` and click **Import**.
3.  **Configure Project:**
    *   **Framework Preset:** Vercel should automatically detect `Vite`.
    *   **Root Directory:** `./` (default).
    *   **Build Command:** `npm run build` (default).
    *   **Output Directory:** `dist` (default).
4.  **Environment Variables:**
    *   Expand the "Environment Variables" section.
    *   Add the following keys from your local `.env` file:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
5.  **Deploy:**
    *   Click **Deploy**.
    *   Wait for the build to complete (approx. 1-2 minutes).

Once finished, you will get a production URL like `https://kibo-v0.vercel.app`.

## 3. Configuring a Custom Domain

To get a domain like `kibo.vercel.app` (or your own `.com`):

1.  Go to your Project Dashboard on Vercel.
2.  Click **Settings** tab -> **Domains**.
3.  **Add a Domain:**
    *   Enter your desired domain (e.g., `kibo-app.com` or `my-kibo.vercel.app`).
    *   Click **Add**.
4.  **DNS Configuration (for custom domains):**
    *   If you bought a domain (e.g., from GoDaddy/Namecheap), Vercel will show you `A` records or `CNAME` records to add to your DNS provider.
    *   If using a `.vercel.app` subdomain, it works instantly if available.

## 4. Supabase Redirects (Important)

For authentication (OAuth/Magic Links) to work on your new domain:

1.  Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2.  Add your new Vercel URL (e.g., `https://kibo-v0.vercel.app`) to the **Site URL** and **Redirect URLs** list.
3.  Save changes.

## 5. Continuous Deployment

Vercel automatically sets up CI/CD.
*   Every time you `git push` to `main`, Vercel will automatically rebuild and deploy your new version.
*   Pull Requests will generate distinct "Preview URLs" for testing before merging.
