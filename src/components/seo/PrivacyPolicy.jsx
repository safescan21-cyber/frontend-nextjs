import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../Seo';

const EMAIL = 'safescan21@gmail.com';
const UPDATED = '16 October 2026';

const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="mb-2 text-xl font-bold text-slate-800">{title}</h2>
    <div className="space-y-2 text-slate-700">{children}</div>
  </section>
);

// Describes what this website actually does with personal data.
const PrivacyPolicy = () => (
  <>
    <Seo
      title="Privacy Policy"
      description="How Food Pharma Machinery collects, uses and protects your personal data when you use our website, place orders or contact us."
      path="/privacy"
    />
    <div className="min-h-screen bg-gray-50 px-4 pb-24 pt-6">
      <article className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
        <h1 className="text-3xl font-bold text-slate-800">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {UPDATED}</p>
        <p className="mt-4 text-slate-700">
          This policy explains what personal data Food Pharma Machinery (“we”) collects through
          www.foodpharmamachinery.com, why we use it and the choices you have.
        </p>

        <Section title="Information we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Account details:</strong> your name, email address and password (stored only as a secure hash), or your Google account name and email if you sign in with Google.</li>
            <li><strong>Order details:</strong> name, email, phone number, delivery address and the products you order.</li>
            <li><strong>Payments:</strong> card payments are processed by Stripe. We never see or store your full card number.</li>
            <li><strong>Messages:</strong> what you send through our contact, quote and newsletter forms, reviews and comments.</li>
            <li><strong>Usage data (only with your consent):</strong> pages and products you view, products you like and items added to cart, and — if enabled — Google Analytics statistics.</li>
          </ul>
        </Section>

        <Section title="How we use it">
          <ul className="list-disc space-y-1 pl-5">
            <li>To process and deliver orders, send invoices, order updates and tracking links by email (and WhatsApp, when available).</li>
            <li>To manage your account, sign-in and saved addresses.</li>
            <li>To answer enquiries and quote requests.</li>
            <li>To send the newsletter if you subscribed — every email has a one-click unsubscribe link.</li>
            <li>With your consent, to understand which pages and products are popular so we can improve the website.</li>
            <li>To keep the website secure, for example by limiting repeated failed sign-in attempts.</li>
          </ul>
        </Section>

        <Section title="Cookies and similar storage">
          <p>
            We use necessary cookies and browser storage to keep you signed in, remember your cart and your cookie choices.
            Analytics tracking runs only if you accept analytics cookies. You can change your choice at any time
            using “Cookie Settings” at the bottom of every page.
          </p>
        </Section>

        <Section title="Who we share it with">
          <p>We do not sell your personal data. We share it only with services that help us run the website:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Stripe (card payments)</li>
            <li>Google (sign-in with Google, Gmail for sending emails, and Google Analytics if you consent)</li>
            <li>Cloudinary (storing uploaded images)</li>
            <li>Our hosting and database providers</li>
            <li>Couriers, to deliver your order</li>
          </ul>
        </Section>

        <Section title="How long we keep it">
          <p>
            Order and invoice records are kept as long as needed for accounting and legal requirements. Website usage
            data is deleted automatically after 180 days. You can ask us to delete your account at any time.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <p>
            You can ask to see, correct or delete your personal data, withdraw consent for analytics, or unsubscribe
            from emails. Write to <a href={`mailto:${EMAIL}`} className="text-amber-700 underline">{EMAIL}</a> and we will reply as soon as possible.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? <Link to="/contact" className="text-amber-700 underline">Contact us</Link> or
            email <a href={`mailto:${EMAIL}`} className="text-amber-700 underline">{EMAIL}</a>.
          </p>
        </Section>
      </article>
    </div>
  </>
);

export default PrivacyPolicy;
