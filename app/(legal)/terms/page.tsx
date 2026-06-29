import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
	title: "Terms of Service",
};

export default function TermsPage() {
	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
			<p className="text-muted-foreground mb-8">Last updated: May 23, 2026</p>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
				<p className="leading-relaxed">
					By creating an account on trashydance, accessing, or using the
					service, you agree to be bound by these Terms of Service. If you do
					not agree to these terms, do not use the service. These terms
					constitute a legally binding agreement between you and trashydance.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					2. Description of Service
				</h2>
				<p className="leading-relaxed">
					trashydance is a real-time 1-to-1 messaging web application that
					allows registered users to exchange text messages, follow other users,
					and manage their social connections. The service is developed as an
					educational project at 42 school and is provided for demonstration and
					learning purposes.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
				<p className="mb-3 leading-relaxed">
					To use trashydance, you must create an account. When registering, you
					agree to:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						Choose a unique username that does not impersonate another person or
						entity
					</li>
					<li>
						Create a password that meets our minimum security requirements (at
						least 8 characters, including uppercase, lowercase, and a number)
					</li>
					<li>
						Keep your login credentials confidential and not share them with
						others
					</li>
					<li>Provide accurate information and keep it up to date</li>
				</ul>
				<p className="mt-3 leading-relaxed">
					You may also register using your 42 Intra account through OAuth 2.0.
					You are responsible for all activity that occurs under your account.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">4. Acceptable Conduct</h2>
				<p className="mb-3 leading-relaxed">
					When using trashydance, you agree not to:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Harass or bully</strong> &mdash; send threatening, abusive,
						or hateful messages to other users
					</li>
					<li>
						<strong>Spam</strong> &mdash; send unsolicited bulk messages,
						advertisements, or repetitive content
					</li>
					<li>
						<strong>Share illegal content</strong> &mdash; distribute content
						that violates applicable laws, including but not limited to
						copyrighted material, illegal imagery, or content promoting violence
					</li>
					<li>
						<strong>Impersonate others</strong> &mdash; pretend to be another
						person, organization, or entity
					</li>
					<li>
						<strong>Exploit the service</strong> &mdash; attempt to gain
						unauthorized access, interfere with the operation of the platform,
						or use automated tools to scrape data
					</li>
					<li>
						<strong>Circumvent security</strong> &mdash; attempt to bypass
						authentication, tamper with session data, or exploit vulnerabilities
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					5. User-Generated Content
				</h2>
				<p className="mb-3 leading-relaxed">
					You retain ownership of the messages and content you create on
					trashydance. By sending messages through the service, you grant
					trashydance a limited, non-exclusive license to store, transmit, and
					display your content solely for the purpose of operating the service
					and delivering messages to their intended recipients.
				</p>
				<p className="leading-relaxed">
					You are solely responsible for the content of your messages. We do not
					pre-screen messages but reserve the right to remove content that
					violates these terms.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
				<p className="leading-relaxed">
					The trashydance name, branding, design, and source code are the
					intellectual property of the trashydance development team. You may not
					copy, modify, distribute, or create derivative works based on the
					trashydance platform without prior written permission, except as
					permitted by any applicable open-source license governing the source
					code.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					7. Limitation of Liability
				</h2>
				<p className="mb-3 leading-relaxed">
					trashydance is an educational project developed as part of the 42
					school curriculum. The service is provided{" "}
					<strong>&ldquo;as is&rdquo;</strong> and{" "}
					<strong>&ldquo;as available&rdquo;</strong> without warranties of any
					kind, whether express or implied.
				</p>
				<p className="mb-3 leading-relaxed">
					To the fullest extent permitted by law, trashydance and its developers
					shall not be liable for:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						Any indirect, incidental, special, or consequential damages arising
						from your use of the service
					</li>
					<li>
						Loss of data, messages, or account information due to technical
						failures
					</li>
					<li>Service interruptions, downtime, or unavailability</li>
					<li>Actions or content of other users on the platform</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">8. Account Termination</h2>
				<p className="mb-3 leading-relaxed">
					We reserve the right to suspend or terminate your account at any time
					if you violate these Terms of Service. Grounds for termination
					include, but are not limited to:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>Repeated violation of the acceptable conduct policy</li>
					<li>Harassment or abuse of other users</li>
					<li>Attempts to compromise the security of the platform</li>
					<li>Use of the service for illegal purposes</li>
				</ul>
				<p className="mt-3 leading-relaxed">
					You may also voluntarily delete your account at any time through the
					account settings. Upon deletion, all your personal data and messages
					will be permanently removed.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					9. Modifications to Terms
				</h2>
				<p className="leading-relaxed">
					We may revise these Terms of Service at any time. When we make
					material changes, we will notify users through the application. The
					&ldquo;Last updated&rdquo; date at the top of this page indicates when
					the terms were last revised. Continued use of trashydance after
					changes are posted constitutes acceptance of the updated terms.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
				<p className="leading-relaxed">
					trashydance is an educational project developed as part of the 42
					school curriculum. These terms are governed by and construed in
					accordance with the laws of the jurisdiction in which the 42 campus
					operating this instance is located. Any disputes arising from or
					relating to these terms shall be resolved in the competent courts of
					that jurisdiction.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">11. Contact</h2>
				<p className="leading-relaxed">
					If you have any questions about these Terms of Service, please contact
					us at:{" "}
					<a
						href={`mailto:${CONTACT_EMAIL}`}
						className="underline hover:text-foreground"
					>
						{CONTACT_EMAIL}
					</a>
				</p>
			</section>
		</main>
	);
}
