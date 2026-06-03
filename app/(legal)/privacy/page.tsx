import { CONTACT_EMAIL } from "@/lib/constants";

export default function PrivacyPage() {
	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
			<p className="text-muted-foreground mb-8">Last updated: May 23, 2026</p>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
				<p className="mb-3 leading-relaxed">
					Welcome to trashydance. We respect your privacy and are committed to
					protecting the personal data you share with us. This Privacy Policy
					explains what information we collect, how we use it, and what rights
					you have in relation to it.
				</p>
				<p className="leading-relaxed">
					trashydance is a real-time 1-to-1 messaging web application developed
					as an educational project at 42 school. By using our service, you
					agree to the collection and use of information in accordance with this
					policy.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					2. Information We Collect
				</h2>
				<p className="mb-3 leading-relaxed">
					We collect the following categories of personal data when you register
					for and use trashydance:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Account information</strong> &mdash; username, email
						address, and password hash (we never store your password in plain
						text)
					</li>
					<li>
						<strong>Profile data</strong> &mdash; profile image URL, display
						name
					</li>
					<li>
						<strong>Messages</strong> &mdash; the text content of messages you
						send and receive through the platform
					</li>
					<li>
						<strong>Technical data</strong> &mdash; IP address, user agent
						(browser and operating system information), and session identifiers
					</li>
					<li>
						<strong>Session data</strong> &mdash; authentication tokens and
						session metadata used to keep you logged in
					</li>
					<li>
						<strong>OAuth data</strong> &mdash; if you sign in via 42 Intra
						OAuth, we receive your 42 user ID, email, and profile information as
						provided by the 42 OAuth provider
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					3. Purpose of Data Collection
				</h2>
				<p className="mb-3 leading-relaxed">
					We use your personal data for the following purposes:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Account management</strong> &mdash; to create and maintain
						your account, authenticate your identity, and enable you to log in
					</li>
					<li>
						<strong>Real-time messaging</strong> &mdash; to deliver, store, and
						display messages between you and other users
					</li>
					<li>
						<strong>Social features</strong> &mdash; to power the follow system,
						online presence indicators, and user search
					</li>
					<li>
						<strong>Security</strong> &mdash; to detect and prevent unauthorized
						access, abuse, and other malicious activity
					</li>
					<li>
						<strong>Service improvement</strong> &mdash; to understand how the
						application is used and to fix bugs
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">4. Legal Basis</h2>
				<p className="mb-3 leading-relaxed">
					We process your personal data on the following legal grounds:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Consent</strong> &mdash; by creating an account and using
						trashydance, you consent to the collection and processing of your
						data as described in this policy
					</li>
					<li>
						<strong>Legitimate interest</strong> &mdash; we process technical
						data (IP address, user agent) for security purposes, including
						protecting against unauthorized access and ensuring the integrity of
						the service
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
				<p className="mb-3 leading-relaxed">
					We retain your personal data for as long as your account is active:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Account data</strong> &mdash; retained until you delete your
						account
					</li>
					<li>
						<strong>Messages</strong> &mdash; retained until you delete your
						account or the conversation is removed
					</li>
					<li>
						<strong>Session data</strong> &mdash; sessions expire automatically
						after a period of inactivity and are purged upon expiration
					</li>
					<li>
						<strong>Technical logs</strong> &mdash; IP addresses and user agent
						data associated with sessions are removed when the session expires
					</li>
				</ul>
				<p className="mt-3 leading-relaxed">
					When you delete your account, all associated personal data, messages,
					and session records are permanently removed from our database.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
				<p className="mb-3 leading-relaxed">
					You have the following rights regarding your personal data:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Right of access</strong> &mdash; you can view all personal
						data associated with your account through your profile settings
					</li>
					<li>
						<strong>Right to rectification</strong> &mdash; you can update your
						username, email, profile image, and other account information at any
						time
					</li>
					<li>
						<strong>Right to erasure</strong> &mdash; you can delete your
						account, which permanently removes all your personal data, messages,
						and associated records
					</li>
					<li>
						<strong>Right to withdraw consent</strong> &mdash; you can stop
						using the service and delete your account at any time
					</li>
				</ul>
				<p className="mt-3 leading-relaxed">
					To exercise any of these rights, use the account settings in the
					application or contact us at{" "}
					<a
						href={`mailto:${CONTACT_EMAIL}`}
						className="underline hover:text-foreground"
					>
						{CONTACT_EMAIL}
					</a>
					.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">7. Data Sharing</h2>
				<p className="mb-3 leading-relaxed">
					We do not sell, trade, or rent your personal data to third parties. We
					do not share your data with any external services except:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>42 OAuth provider</strong> &mdash; if you choose to sign in
						via 42 Intra, authentication data is exchanged with the 42 OAuth
						service solely for the purpose of verifying your identity
					</li>
				</ul>
				<p className="mt-3 leading-relaxed">
					Your messages are only visible to you and the intended recipient. We
					do not perform any automated analysis, profiling, or mining of message
					content.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
				<p className="mb-3 leading-relaxed">
					trashydance uses only essential session cookies to maintain your
					authenticated state. We do not use any tracking, analytics, or
					advertising cookies.
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Session cookie</strong> &mdash; stores your session
						identifier to keep you logged in
					</li>
					<li>
						<strong>Cookie attributes</strong> &mdash; all cookies are set with{" "}
						<code className="text-sm bg-muted px-1 py-0.5 rounded">
							HttpOnly
						</code>
						,{" "}
						<code className="text-sm bg-muted px-1 py-0.5 rounded">Secure</code>
						, and{" "}
						<code className="text-sm bg-muted px-1 py-0.5 rounded">
							SameSite=Lax
						</code>{" "}
						flags to prevent cross-site attacks and JavaScript access
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					9. Children&apos;s Privacy
				</h2>
				<p className="leading-relaxed">
					trashydance is not intended for use by anyone under the age of 13. We
					do not knowingly collect personal data from children under 13. If we
					become aware that we have collected data from a child under 13, we
					will take steps to delete that information as soon as possible. If you
					believe that a child under 13 has provided us with personal data,
					please contact us at{" "}
					<a
						href={`mailto:${CONTACT_EMAIL}`}
						className="underline hover:text-foreground"
					>
						{CONTACT_EMAIL}
					</a>
					.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">
					10. Changes to This Policy
				</h2>
				<p className="leading-relaxed">
					We may update this Privacy Policy from time to time to reflect changes
					in our practices or for legal, operational, or regulatory reasons. We
					will notify users of material changes through the application. The
					&ldquo;Last updated&rdquo; date at the top of this page indicates when
					the policy was last revised. Continued use of trashydance after
					changes constitutes acceptance of the updated policy.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
				<p className="leading-relaxed">
					If you have any questions about this Privacy Policy or our data
					practices, please contact us at:{" "}
					<a
						href={`mailto:${CONTACT_EMAIL}`}
						className="underline hover:text-foreground"
					>
						{CONTACT_EMAIL}
					</a>
					.
				</p>
			</section>
		</main>
	);
}
