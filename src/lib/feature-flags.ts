export function checkFeatureFlag(flag: string): boolean {
    const value = process.env[flag]
    return value === 'true'
}

export function getFeatureFlags() {
    return {
        payments: checkFeatureFlag('FLAG_ENABLE_PAYMENTS'),
        emails: checkFeatureFlag('FLAG_ENABLE_EMAILS'),
        webhooks: checkFeatureFlag('FLAG_ENABLE_WEBHOOKS'),
    }
}

export function requireFeatureFlag(flag: string) {
    if (!checkFeatureFlag(flag)) {
        return new Response(
            JSON.stringify({
                error: 'Feature not enabled',
                message: `A funcionalidade está desabilitada no ambiente atual`
            }),
            {
                status: 501,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
    return null
}
