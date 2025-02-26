import { OAuth2RequestError } from "arctic"
import { createAppleAuthWithCallback } from "@/auth"
import { createAppleUserUseCase } from "@/use-cases/users"
import { getAccountByAppleId } from "@/data-access/accounts"
import { afterLoginUrl } from "@/app-config"
import { setSession } from "@/lib/session"

export interface AppleUser {
	sub: string
	email: string
	name?: {
		firstName: string
		lastName: string
	}
}

// Helper to parse cookies from the request
function getCookieValue(request: Request, name: string): string | null {
	const cookies = request.headers.get("cookie")
	if (!cookies) return null

	const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`))
	return match ? match[2] : null
}

// Handle form_post response mode from Apple
export async function POST(request: Request): Promise<Response> {
	const formData = await request.formData()
	const code = formData.get("code")?.toString()
	const state = formData.get("state")?.toString()
	const userStr = formData.get("user")?.toString()

	// Get state from cookie
	const storedState = getCookieValue(request, "apple_oauth_state")

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		})
	}

	try {
		// Construct a callback URL based on the incoming request
		const url = new URL(request.url)
		const callbackUrl = url.origin + url.pathname
		const customAppleAuth = createAppleAuthWithCallback(callbackUrl)

		const tokens = await customAppleAuth.validateAuthorizationCode(code)
		const idToken = tokens.idToken()

		const tokenParts = idToken.split(".")
		const tokenPayload = JSON.parse(atob(tokenParts[1]))

		// Create the user object
		const appleUser: AppleUser = {
			sub: tokenPayload.sub,
			email: tokenPayload.email,
			// Try to get name from the user string if available
			// Apple only sends this on first login
		}

		// Parse user data if available (this is only sent on first authentication)
		if (userStr) {
			try {
				const userData = JSON.parse(userStr)
				if (userData.name) {
					appleUser.name = {
						firstName: userData.name.firstName,
						lastName: userData.name.lastName,
					}
				}
			} catch (e) {
				console.error("Failed to parse Apple user data:", e)
			}
		}

		// Rest of the authentication process
		const existingAccount = await getAccountByAppleId(appleUser.sub)

		if (existingAccount) {
			await setSession(existingAccount.userId)
			return new Response(null, {
				status: 302,
				headers: {
					Location: afterLoginUrl,
				},
			})
		}

		const userId = await createAppleUserUseCase(appleUser)
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

// Keep GET method for backward compatibility or direct access
export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")

	// Get state from cookie
	const storedState = getCookieValue(request, "apple_oauth_state")

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		})
	}

	try {
		// Construct a callback URL based on the incoming request
		const callbackUrl = url.origin + url.pathname
		const customAppleAuth = createAppleAuthWithCallback(callbackUrl)

		const tokens = await customAppleAuth.validateAuthorizationCode(code)
		const idToken = tokens.idToken()

		const tokenParts = idToken.split(".")
		const tokenPayload = JSON.parse(atob(tokenParts[1]))

		const appleUser: AppleUser = {
			sub: tokenPayload.sub,
			email: tokenPayload.email,
			// Apple doesn't reliably provide name information
		}

		const existingAccount = await getAccountByAppleId(appleUser.sub)

		if (existingAccount) {
			await setSession(existingAccount.userId)
			return new Response(null, {
				status: 302,
				headers: {
					Location: afterLoginUrl,
				},
			})
		}

		const userId = await createAppleUserUseCase(appleUser)
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
