export default {
  jwt: {
    secret_token: process.env.APP_SECRET_TOKEN || 'default',
    expires_in_token: '1h',
    secret_refresh_token: process.env.APP_SECRET_REFRESH_TOKEN || 'default',
    expires_in_refresh_token: '90d',
    expires_refresh_token_days: 90
  }
}
