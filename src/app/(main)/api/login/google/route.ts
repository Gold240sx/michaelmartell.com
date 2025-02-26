import { createGoogleAuthWithCallback } from "@/auth"
import { generateCodeVerifier, generateState } from "arctic"

export async function GET(request: Request): Promise<Response> {
	const state = generateState()
	const codeVerifier = generateCodeVerifier()

	// Get origin from request
	const url = new URL(request.url)
	const origin = url.origin

	// Create a customized callback URL based on the origin
	const callbackUrl = `${origin}/api/login/google/callback`

	// Create a custom Google auth instance with the correct callback URL
	const customGoogleAuth = createGoogleAuthWithCallback(callbackUrl)
	const authUrl = await customGoogleAuth.createAuthorizationURL(
		state,
		codeVerifier,
		["profile", "email"]
	)

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
		`google_oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; ${isLocalhost ? "SameSite=Lax" : "SameSite=None; Secure"}`
	)

	// Set code verifier cookie
	response.headers.append(
		"Set-Cookie",
		`google_code_verifier=${codeVerifier}; Path=/; HttpOnly; Max-Age=600; ${isLocalhost ? "SameSite=Lax" : "SameSite=None; Secure"}`
	)

	return response
}
