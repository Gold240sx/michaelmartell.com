import { OAuth2RequestError } from "arctic"
import { createGoogleAuthWithCallback } from "@/auth"
import { createGoogleUserUseCase } from "@/use-cases/users"
import { getAccountByGoogleIdUseCase } from "@/use-cases/accounts"
import { setSession } from "@/lib/session"
import { afterLoginUrl } from "@/app-config"

// Helper to parse cookies from the request
function getCookieValue(request: Request, name: string): string | null {
	const cookies = request.headers.get("cookie")
	if (!cookies) return null

	const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`))
	return match ? match[2] : null
}

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")

	// Get cookies directly from request headers
	const storedState = getCookieValue(request, "google_oauth_state")
	const codeVerifier = getCookieValue(request, "google_code_verifier")

	if (
		!code ||
		!state ||
		!storedState ||
		state !== storedState ||
		!codeVerifier
	) {
		return new Response(null, {
			status: 400,
		})
	}

	try {
		// Construct a callback URL based on the incoming request
		const callbackUrl = url.origin + url.pathname
		const customGoogleAuth = createGoogleAuthWithCallback(callbackUrl)

		const tokens = await customGoogleAuth.validateAuthorizationCode(
			code,
			codeVerifier
		)
		const response = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			}
		)

		const googleUser: GoogleUser = await response.json()

		const existingAccount = await getAccountByGoogleIdUseCase(
			googleUser.sub
		)

		if (existingAccount) {
			await setSession(existingAccount.userId)
			return new Response(null, {
				status: 302,
				headers: {
					Location: afterLoginUrl,
				},
			})
		}

		const userId = await createGoogleUserUseCase(googleUser)

		await setSession(userId)

		return new Response(null, {
			status: 302,
			headers: {
				Location: afterLoginUrl,
			},
		})
	} catch (e) {
		console.error(e)
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400,
			})
		}
		return new Response(null, {
			status: 500,
		})
	}
}

export interface GoogleUser {
	sub: string
	name: string
	given_name: string
	family_name: string
	picture: string
	email: string
	email_verified: boolean
	locale: string
}
