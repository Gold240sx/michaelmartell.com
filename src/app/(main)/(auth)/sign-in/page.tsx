"use client"

import * as React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { btnStyles } from "@/styles/icons"
import { Mail } from "lucide-react"
import Link from "next/link"
import { MagicLinkForm } from "./magic-link-form"

export default function SignInPage() {
	return (
		<div className="py-24 flex min-h-[80dvh] items-center justify-center mx-auto">
			<div className="mx-auto max-w-md space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Sign In</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Sign in to your account using one of the options below.
					</p>
				</div>
				<div className="space-y-4">
					<Link
						href="/api/login/google"
						className={cn(
							buttonVariants({
								variant: "secondary",
							}),
							"w-full"
						)}>
						<GoogleIcon className="stroke-white mr-2 h-5 w-5" />
						Sign in with Google
					</Link>
					<Link
						href="/api/login/github"
						className={cn(
							buttonVariants({
								variant: "secondary",
							}),
							"w-full"
						)}>
						<GithubIcon className="mr-2 h-5 w-5" />
						Sign in with GitHub
					</Link>
					<Link
						href="/api/login/discord"
						className={cn(
							buttonVariants({
								variant: "secondary",
							}),
							"w-full"
						)}>
						<DiscordIcon className="mr-2 h-5 w-5" />
						Sign in with Discord
					</Link>
					<Link
						href="/api/login/apple"
						className={cn(
							buttonVariants({
								variant: "secondary",
							}),
							"w-full"
						)}>
						<AppleIcon className="mr-2 h-5 w-5" />
						Sign in with Apple
					</Link>

					<div className="relative py-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-gray-100 px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
								Or sign in with email
							</span>
						</div>
					</div>

					<MagicLinkForm />

					<div className="relative py-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-gray-100 px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
								Other options
							</span>
						</div>
					</div>

					<div className="flex justify-center">
						<Button
							asChild
							variant="ghost"
							className={cn(btnStyles, "w-full")}>
							<Link href="/sign-in/email">
								<Mail /> Sign in with Email
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg">
			<title>Google</title>
			<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
		</svg>
	)
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
			<path d="M9 18c-4.51 2-5-2-7-2" />
		</svg>
	)
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="currentColor"
			stroke="none">
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	)
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="currentColor"
			stroke="none">
			<path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
		</svg>
	)
}
