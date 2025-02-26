import { OAuth2RequestError } from "arctic"
import { discordAuth } from "@/auth"
import { createDiscordUserUseCase } from "@/use-cases/users"
import { getAccountByDiscordId } from "@/data-access/accounts"
import { afterLoginUrl } from "@/app-config"
import { setSession } from "@/lib/session"

export interface DiscordUser {
	id: string
	username: string
	avatar: string | null
	email: string
}

// Helper to parse cookies from the request
function getCookieValue(request: Request, name: string): string | null {
	const cookies = request.headers.get("cookie")
	if (!cookies) return null

	const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`))
	return match ? match[2] : null
}

export async function GET(request: Request): Promise<Response> {
	// Extract the authorization code and state from the URL
	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")

	// Get the stored state from cookies for verification
	const storedState = getCookieValue(request, "discord_oauth_state")

	// Validate the request parameters
	if (!code || !state || !storedState || state !== storedState) {
		console.error("Discord OAuth validation failed", {
			code: !!code,
			state: !!state,
			storedState: !!storedState,
			stateMatch: state === storedState,
		})
		return new Response("Invalid OAuth request", {
			status: 400,
		})
	}

	try {
		// Exchange the authorization code for tokens
		const tokens = await discordAuth.validateAuthorizationCode(code)

		// Use the access token to fetch the user's profile
		const accessToken = tokens.accessToken()
		const discordUserResponse = await fetch(
			"https://discord.com/api/users/@me",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		)

		// Parse the user data
		const discordUser: DiscordUser = await discordUserResponse.json()

		// Check if this Discord account is already linked to a user
		const existingAccount = await getAccountByDiscordId(discordUser.id)

		if (existingAccount) {
			// If the account exists, create a session for the user
			await setSession(existingAccount.userId)
			return new Response(null, {
				status: 302,
				headers: {
					Location: afterLoginUrl,
				},
			})
		}

		// If the account doesn't exist, create a new user and link it
		const userId = await createDiscordUserUseCase(discordUser)
		await setSession(userId)

		// Redirect to the after-login page
		return new Response(null, {
			status: 302,
			headers: {
				Location: afterLoginUrl,
			},
		})
	} catch (e) {
		console.error("Discord OAuth error:", e)

		// Handle specific OAuth errors
		if (e instanceof OAuth2RequestError) {
			return new Response("Invalid authorization code", {
				status: 400,
			})
		}

		// Handle other errors
		return new Response("Authentication failed", {
			status: 500,
		})
	}
}
