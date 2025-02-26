import { SignedIn } from "@/components/auth"
import { SignedOut } from "@/components/auth"
import Container from "@/components/container"
import { CheckoutButton } from "@/components/stripe/upgrade-button/checkout-button"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { env } from "@/env"
import { CheckIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import PremiumImage from "@/assets/icons/App icons/baruchu/Baruchu_base.png"
import PremiumPlusImage from "@/assets/icons/App icons/baruchu/Baruchu_premium.png"
import { StaticImageData } from "next/image"

function PricingCard({
	title,
	price,
	features,
	image,
	reoccurance,
	hasSubscription,
	className,
	priceId,
}: {
	title: string
	price: string
	priceId: string
	className?: string
	image?: string | StaticImageData | undefined
	reoccurance?: "month" | "year" | "one-time" | undefined
	hasSubscription: boolean
	features: string[]
}) {
	if (
		reoccurance !== "month" &&
		reoccurance !== "year" &&
		reoccurance !== "one-time" &&
		reoccurance !== undefined
	) {
		throw new Error(
			`Invalid reoccurance, must be month, year or one-time, ${title} has ${reoccurance}`
		)
	}

	return (
		<div
			className={`${className} flex overflow-hidden relative flex-col w-full p-6 text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-800 xl:p-8 dark:bg-transparent dark:text-white`}>
			<div className="glow absolute -z-10 aspect-square w-full max-w-xl rounded-full bg-gradient-to-br from-blue-600/15 to-green-500/15 blur-3xl filter" />
			{image && (
				<div className="flex justify-center mb-6">
					<Image
						src={image}
						priority={true}
						alt={title}
						placeholder="blur"
						width={150}
						height={150}
						className=""
					/>
				</div>
			)}
			<h3 className="text-xl font-semibold">{title}</h3>

			<div className="mr-2 text-4xl font-extrabold mb-8 mt-5">
				${price} / {reoccurance || "month"}
			</div>

			<p className="font-light sm:text-lg mb-2 text-left">
				What this plan includes:
			</p>

			<ul role="list" className="mb-8 text-left leading-10">
				{features.map((feature) => (
					<li key={feature} className="flex items-center space-x-3">
						<CheckIcon className="text-green-400 size-5" />
						<span className="dark:text-gray-200">{feature}</span>
					</li>
				))}
			</ul>

			<div className="mt-auto">
				<SignedIn>
					{hasSubscription ? (
						<Button variant={"default"} asChild>
							<Link href={"/dashboard"}>Go to Dashboard</Link>
						</Button>
					) : (
						<CheckoutButton priceId={priceId} className="w-full">
							Upgrade now
						</CheckoutButton>
					)}
				</SignedIn>

				<SignedOut>
					<Button variant={"default"} asChild className="w-full">
						<Link href={"/sign-in"}>Sign in to Upgrade</Link>
					</Button>
				</SignedOut>
			</div>
		</div>
	)
}
const pricingPlans = [
	{
		title: "Premium",
		priceMonthly: "10",
		priceYearly: "75",
		priceIdMonthly: env.NEXT_PUBLIC_PRICE_ID_BASIC,
		priceIdYearly: env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY,
		image: PremiumImage,
		features: [
			"Complete Next.js Solution",
			"Stripe Integration",
			"User Authentication",
			"Role Based Authorization",
			"User Dashboard",
		],
	},
	{
		title: "Premium +",
		priceMonthly: "15",
		priceYearly: "110",
		priceIdMonthly: env.NEXT_PUBLIC_PRICE_ID_PREMIUM,
		// @ts-ignore
		priceIdYearly: env.NEXT_PUBLIC_PRICE_ID_PREMIUM_YEARLY,
		image: PremiumPlusImage,
		features: [
			"Complete Next.js Solution",
			"Stripe Integration",
			"User Authentication",
			"Role Based Authorization",
			"User Dashboard",
		],
	},
]

const renderPricingCards = (
	type: "monthly" | "yearly",
	hasSubscription: boolean
) => {
	return pricingPlans.map((plan) => (
		<PricingCard
			key={plan.title}
			title={plan.title}
			price={type === "monthly" ? plan.priceMonthly : plan.priceYearly}
			reoccurance={type === "yearly" ? "year" : undefined}
			image={plan.image}
			hasSubscription={hasSubscription}
			priceId={
				type === "monthly" ? plan.priceIdMonthly : plan.priceIdYearly
			}
			features={plan.features}
			className="md:min-w-[400px]"
		/>
	))
}

export function PricingSection({
	hasSubscription,
}: {
	hasSubscription: boolean
}) {
	return (
		<section id="pricing">
			<Container>
				<h2 className="mb-5 text-center text-5xl font-bold text-gray-900 dark:text-white">
					Simple pricing for everyone
				</h2>
				<p className="mb-14 max-w-3xl text-center w-full">
					Choose the plan that suits you best. Enjoy full access to
					premium content and expert support.{" "}
					<br className="hidden md:block" /> Start your journey today
					and achieve your goals!
				</p>

				{/* Toggle to toggle between the prices */}
				<Tabs
					defaultValue="monthly"
					className="flex flex-col items-center gap-4">
					<TabsList className="grid grid-cols-2 w-[400px]">
						<TabsTrigger value="monthly">Monthly</TabsTrigger>
						<TabsTrigger value="yearly">Yearly</TabsTrigger>
					</TabsList>
					<TabsContent value="monthly" className="w-full">
						<div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-12">
							{renderPricingCards("monthly", hasSubscription)}
						</div>
					</TabsContent>
					<TabsContent value="yearly" className="w-full">
						<div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-12">
							{renderPricingCards("yearly", hasSubscription)}
						</div>
					</TabsContent>
				</Tabs>
			</Container>
		</section>
	)
}
