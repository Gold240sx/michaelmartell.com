import { discordAuth } from "@/auth"
import { generateState } from "arctic"

export async function GET(request: Request): Promise<Response> {
	// Generate a secure random state
	const state = generateState()

	// Create the authorization URL with the required scopes
	// Discord requires 'identify' scope at minimum, 'email' for email access
	const authorizationURL = await discordAuth.createAuthorizationURL(state, [
		"identify",
		"email",
	])

	// Create a response that redirects to Discord's authorization page
	const response = new Response(null, {
		status: 302,
		headers: {
			Location: authorizationURL.toString(),
		},
	})

	// Set the state in a cookie for verification in the callback
	// Discord requires state verification for security
	const isLocalhost =
		request.headers.get("host")?.includes("localhost") ?? false

	response.headers.append(
		"Set-Cookie",
		`discord_oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; ${
			isLocalhost ? "SameSite=Lax" : "SameSite=None; Secure"
		}`
	)

	return response
}
