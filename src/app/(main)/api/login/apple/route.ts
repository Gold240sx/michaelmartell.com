import { createAppleAuthWithCallback } from "@/auth"
import { generateState } from "arctic"

export async function GET(request: Request): Promise<Response> {
	const state = generateState()

	// Get origin from request
	const url = new URL(request.url)
	const origin = url.origin

	// Create a customized callback URL based on the origin
	const callbackUrl = `${origin}/api/login/apple/callback`

	// Create a custom Apple auth instance with the correct callback URL
	const customAppleAuth = createAppleAuthWithCallback(callbackUrl)
	const authUrl = await customAppleAuth.createAuthorizationURL(state, [
		"name",
		"email",
	])

	// Apple requires response_mode=form_post when requesting name or email scopes
	authUrl.searchParams.set("response_mode", "form_post")

	// Set the cookie using the response
	const response = new Response(null, {
		status: 302,
		headers: {
			Location: authUrl.toString(),
		},
	})

	// Determine cookie settings based on environment
	const isLocalhost = url.hostname === "localhost"
	response.headers.append(
		"Set-Cookie",
		`apple_oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; ${isLocalhost ? "SameSite=Lax" : "SameSite=None; Secure"}`
	)

	return response
}
