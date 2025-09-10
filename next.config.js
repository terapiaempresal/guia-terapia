/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
        FLAG_ENABLE_PAYMENTS: process.env.FLAG_ENABLE_PAYMENTS,
        FLAG_ENABLE_EMAILS: process.env.FLAG_ENABLE_EMAILS,
        FLAG_ENABLE_WEBHOOKS: process.env.FLAG_ENABLE_WEBHOOKS,
        APP_URL: process.env.APP_URL,
        NEXT_PUBLIC_SMTP_HOST: process.env.SMTP_HOST,
        NEXT_PUBLIC_EMAIL_FROM: process.env.EMAIL_FROM,
        NEXT_PUBLIC_FLAG_ENABLE_EMAILS: process.env.FLAG_ENABLE_EMAILS,
    },
}

module.exports = nextConfig