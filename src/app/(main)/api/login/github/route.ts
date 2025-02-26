import { createGitHubAuthWithCallback } from "@/auth"
import { generateState } from "arctic"

export async function GET(request: Request): Promise<Response> {
	const state = generateState()

	// Get origin from request
	const url = new URL(request.url)
	const origin = url.origin

	// Create a customized callback URL based on the origin
	const callbackUrl = `${origin}/api/login/github/callback`

	// Create a custom GitHub auth instance with the correct callback URL
	const customGitHubAuth = createGitHubAuthWithCallback(callbackUrl)
	const authUrl = await customGitHubAuth.createAuthorizationURL(state, [
		"user:email",
	])

	// Set the cookie using the response
	const response = new Response(null, {
		status: 302,
		headers: {
			Location: authUrl.toString(),
		},
	})

	// Determine cookie settings based on environment
	const isLocalhost = url.hostname === "localhost"

	// Set state cookie
	response.headers.append(
		"Set-Cookie",
		`github_oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; ${isLocalhost ? "SameSite=Lax" : "SameSite=None; Secure"}`
	)

	return response
}
