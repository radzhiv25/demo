# Swiggy production handoff

## Redirect URI

The callback path to use when OAuth is implemented is:

`https://<your-production-domain>/api/auth/callback/swiggy`

Replace `<your-production-domain>` with the final HTTPS domain after deployment, then send the complete value to Swiggy exactly as deployed. It must be an exact-match, non-local HTTPS URL.

## Before sending the demo

1. Deploy MealPilot to a stable HTTPS domain.
2. Set the final domain in the app's production environment as `APP_URL`.
3. Send Swiggy the exact callback URI above with the deployed domain.
4. Record a short video that shows: selecting a saved address, using current location to add an address, searching for a meal, reviewing the cart, and confirming the order.
5. Keep Swiggy access tokens in server-only secure storage. Do not place them in browser-visible environment variables or in the video.

## OAuth requirements

Swiggy uses OAuth 2.1 with PKCE and dynamic client registration. The callback must validate `state`, exchange the authorization code using the original PKCE verifier, and store the resulting access token securely. Access tokens expire after five days; a 401 should start authorization again.
