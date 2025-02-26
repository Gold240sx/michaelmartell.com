import { OAuth2RequestError } from "arctic"
import { createGitHubAuthWithCallback } from "@/auth"
import { createGithubUserUseCase } from "@/use-cases/users"
import { getAccountByGithubIdUseCase } from "@/use-cases/accounts"
import { afterLoginUrl } from "@/app-config"
import { setSession } from "@/lib/session"

export interface GitHubUser {
	id: string
	login: string
	avatar_url: string
	email: string
}

interface Email {
	email: string
	primary: boolean
	verified: boolean
	visibility: string | null
}

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

	// Get state from cookie directly
	const storedState = getCookieValue(request, "github_oauth_state")

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		})
	}

	try {
		// Construct a callback URL based on the incoming request
		const callbackUrl = url.origin + url.pathname
		const customGitHubAuth = createGitHubAuthWithCallback(callbackUrl)

		const tokens = await customGitHubAuth.validateAuthorizationCode(code)
		const accessToken = tokens.accessToken()
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		const githubUser: GitHubUser = await githubUserResponse.json()

		const existingAccount = await getAccountByGithubIdUseCase(githubUser.id)

		if (existingAccount) {
			await setSession(existingAccount.userId)
			return new Response(null, {
				status: 302,
				headers: {
					Location: afterLoginUrl,
				},
			})
		}

		if (!githubUser.email) {
			const githubUserEmailResponse = await fetch(
				"https://api.github.com/user/emails",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			)
			const githubUserEmails = await githubUserEmailResponse.json()

			githubUser.email = getPrimaryEmail(githubUserEmails)
		}

		const userId = await createGithubUserUseCase(githubUser)
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

function getPrimaryEmail(emails: Email[]): string {
	const primaryEmail = emails.find((email) => email.primary)
	return primaryEmail!.email
}
