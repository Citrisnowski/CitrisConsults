# Citris Consulting Next.js App

This repository contains the source code for the **Citris Consulting** website. It is built with [Next.js](https://nextjs.org/) using the App Router, TypeScript and [Tailwind CSS](https://tailwindcss.com/). Authentication is powered by [Supabase](https://supabase.com/) and payments are handled via [Stripe](https://stripe.com/). The project is designed to be deployed on **AWS Amplify Hosting**.

## Features

- **Responsive design:** mobile‑first layout with bold typography, rounded corners and a clean aesthetic.
- **Persistent navigation:** a sticky header with brand logo, links to Services and Subscriptions, and authentication actions that react to the logged‑in state.
- **Authentication:** email/password sign up and sign in using Supabase. The session persists on the client and automatically updates the UI when the user logs in or out.
- **Subscription plans:** a Subscriptions page with two pricing tiers (Basic and Pro). Clicking *Subscribe* creates a Stripe Checkout Session and redirects the user to a hosted checkout page. The code also supports Stripe’s embedded checkout when enabled via environment variables.
- **Account page:** protected route that shows the user’s name and email, a placeholder for managing their subscription, and a sign‑out button.
- **404 page:** custom not‑found page styled consistently with the rest of the site.
- **Serverless API routes:** Next.js route handlers create Stripe Checkout Sessions and verify Stripe webhook signatures.
- **Amplify deployment:** includes an `amplify.yml` file to instruct AWS Amplify how to build and serve the app and documents the required environment variables.

## Getting Started (Local Development)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env.local` and fill in your own values. At a minimum you need to provide:

   - `NEXT_PUBLIC_SUPABASE_URL` – the URL of your Supabase project
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – your Supabase anon/public API key
   - `STRIPE_SECRET_KEY` – your Stripe secret key (for creating Checkout Sessions)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` – your Stripe publishable key (used on the client)
   - `STRIPE_WEBHOOK_SECRET` – webhook signing secret (see **Webhooks** below)
   - `PRICE_BASIC` and `PRICE_PRO` – price IDs for your Basic and Pro subscription plans
   - `NEXT_PUBLIC_PRICE_BASIC` and `NEXT_PUBLIC_PRICE_PRO` – duplicates of the above for client‑side access

   You can optionally set `NEXT_PUBLIC_USE_EMBEDDED_CHECKOUT` to `true` to attempt to use Stripe’s Embedded Checkout. In test mode this feature may not be available; in that case the app will automatically redirect users to the standard hosted checkout page.

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. The page should reload automatically when you edit files.

## Creating Stripe Products and Prices

1. Sign in to your Stripe dashboard and ensure you are in **Test Mode**.
2. Navigate to **Products** and create two products (e.g. “Basic Plan” and “Pro Plan”). For each product, add a **recurring** price (monthly or yearly) with the amount of your choosing.
3. After saving each price, copy its **Price ID** (it will look like `price_12345…`).
4. Place the IDs into your `.env.local` file under `PRICE_BASIC` and `PRICE_PRO`, and duplicate them into `NEXT_PUBLIC_PRICE_BASIC` and `NEXT_PUBLIC_PRICE_PRO` if you intend to reference them on the client.

## Running a local Stripe webhook

To test webhook handling in development you need the Stripe CLI. Once installed, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This command proxies events from Stripe to your local `/api/stripe/webhook` endpoint. The CLI will print a webhook signing secret (prefixed with `whsec_…`); copy this value into `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

The current webhook handler simply verifies the signature and logs the incoming event type. You can extend the implementation in `app/api/stripe/webhook/route.ts` to provision accounts, grant access to content or sync metadata based on events such as `checkout.session.completed` and `customer.subscription.updated`.

## Deploying on AWS Amplify

1. Push your repository to a Git provider such as GitHub. In the AWS Amplify console, choose **New app → Host a web app** and connect the repository.
2. When configuring the build settings, Amplify will detect your Next.js app and automatically create a build specification. Replace it with the provided `amplify.yml` to ensure that dependencies are installed and the project is built correctly:

   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

3. Configure the following environment variables in the Amplify console (these names must match exactly):

   | Name | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `STRIPE_SECRET_KEY` | Stripe secret key (server) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client) |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
   | `PRICE_BASIC` | Price ID for the Basic plan |
   | `PRICE_PRO` | Price ID for the Pro plan |
   | `NEXT_PUBLIC_PRICE_BASIC` | Duplicate of PRICE_BASIC for client access |
   | `NEXT_PUBLIC_PRICE_PRO` | Duplicate of PRICE_PRO for client access |
   | `NEXT_PUBLIC_USE_EMBEDDED_CHECKOUT` | `true` to attempt embedded checkout, otherwise leave blank or set `false` |

4. Save and deploy. Amplify will run `npm ci`, `npm run build` and host the compiled `.next` output.

5. After the site is live, configure the Stripe webhook with your production URL (e.g. `https://your-amplify-domain.com/api/stripe/webhook`) and the same signing secret you set in `STRIPE_WEBHOOK_SECRET`.

## Troubleshooting

- **Missing price IDs:** If the *Subscribe* buttons are disabled, double‑check that you set `PRICE_BASIC`, `PRICE_PRO`, `NEXT_PUBLIC_PRICE_BASIC` and `NEXT_PUBLIC_PRICE_PRO` in your environment. Without these values the subscription page cannot create a Checkout Session.
- **Embedded checkout not working:** The embedded checkout is a beta Stripe feature. If you set `NEXT_PUBLIC_USE_EMBEDDED_CHECKOUT=true` but see a console warning or nothing renders, simply leave the flag unset or set it to `false`. The app will fall back to the hosted checkout experience.
- **Authentication issues:** Make sure your Supabase project’s **Email** and **Password** auth providers are enabled in the Supabase dashboard. Check your anon key and project URL for typos.

## License

This project is provided for demonstration purposes and does not include any proprietary Citris Consulting content. You are free to adapt it to your own business needs.