import { GitHub, Google, Discord, Apple } from "arctic"
import { database } from "@/db"
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding"
import { Session, sessions, User, users } from "@/db/schema"
import { env } from "@/env"
import { eq } from "drizzle-orm"
import { sha256 } from "@oslojs/crypto/sha2"
import { UserId } from "./use-cases/types"
import { getSessionToken } from "./lib/session"

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2

export const github = new GitHub(
	env.GITHUB_CLIENT_ID,
	env.GITHUB_CLIENT_SECRET,
	`${env.HOST_NAME}/api/login/github/callback`
)

export const googleAuth = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${env.HOST_NAME}/api/login/google/callback`
)

export const discordAuth = new Discord(
	env.AUTH_DISCORD_ID,
	env.AUTH_DISCORD_SECRET,
	`${env.HOST_NAME}/api/login/discord/callback`
)

export const appleAuth = new Apple(
	env.APPLE_CLIENT_ID,
	env.APPLE_TEAM_ID,
	env.APPLE_KEY_ID,
	new TextEncoder().encode(env.APPLE_PRIVATE_KEY),
	`${env.HOST_NAME}/api/login/apple/callback`
)

export function createGitHubAuthWithCallback(callbackUrl: string) {
	return new GitHub(
		env.GITHUB_CLIENT_ID,
		env.GITHUB_CLIENT_SECRET,
		callbackUrl
	)
}

export function createDiscordAuthWithCallback(callbackUrl: string) {
	return new Discord(
		env.AUTH_DISCORD_ID,
		env.AUTH_DISCORD_SECRET,
		callbackUrl
	)
}

export function createGoogleAuthWithCallback(callbackUrl: string) {
	return new Google(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET,
		callbackUrl
	)
}

export function createAppleAuthWithCallback(callbackUrl: string) {
	return new Apple(
		env.APPLE_CLIENT_ID,
		env.APPLE_TEAM_ID,
		env.APPLE_KEY_ID,
		new TextEncoder().encode(env.APPLE_PRIVATE_KEY),
		callbackUrl
	)
}

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function createSession(
	token: string,
	userId: UserId
): Promise<Session> {
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token))
	)
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
	}
	await database.insert(sessions).values(session)
	return session
}

export async function validateRequest(): Promise<SessionValidationResult> {
	const sessionToken = await getSessionToken()
	if (!sessionToken) {
		return { session: null, user: null }
	}
	return validateSessionToken(sessionToken)
}

export async function validateSessionToken(
	token: string
): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token))
	)
	const sessionInDb = await database.query.sessions.findFirst({
		where: eq(sessions.id, sessionId),
	})
	if (!sessionInDb) {
		return { session: null, user: null }
	}
	if (Date.now() >= sessionInDb.expiresAt.getTime()) {
		await database.delete(sessions).where(eq(sessions.id, sessionInDb.id))
		return { session: null, user: null }
	}
	const user = await database.query.users.findFirst({
		where: eq(users.id, sessionInDb.userId),
	})

	if (!user) {
		await database.delete(sessions).where(eq(sessions.id, sessionInDb.id))
		return { session: null, user: null }
	}

	if (
		Date.now() >=
		sessionInDb.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS
	) {
		sessionInDb.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS)
		await database
			.update(sessions)
			.set({
				expiresAt: sessionInDb.expiresAt,
			})
			.where(eq(sessions.id, sessionInDb.id))
	}
	return { session: sessionInDb, user }
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await database.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function invalidateUserSessions(userId: UserId): Promise<void> {
	await database.delete(sessions).where(eq(users.id, userId))
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null }
