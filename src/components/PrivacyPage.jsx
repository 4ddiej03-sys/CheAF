// components/PrivacyPage.jsx
export default function PrivacyPage({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 2000, overflowY: "auto" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
        <button type="button" onClick={onClose}
          style={{ background: "none", border: "1px solid rgba(245,240,232,0.2)", color: "#f5f0e8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 32, fontSize: 14 }}>
          ← Back
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 40, fontWeight: 900, color: "#f5f0e8", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: "rgba(245,240,232,0.4)", fontSize: 13, marginBottom: 40 }}>Last updated: March 13, 2026</p>

        {[
          {
            title: "1. Who We Are",
            body: `Che AF is a sole trader business registered in New Zealand. We operate the recipe and meal planning app at che-af.vercel.app. For privacy enquiries contact us at support@che-af.vercel.app`
          },
          {
            title: "2. What Information We Collect",
            body: `We collect your email address when you create an account. We store your recipes, pantry items, shopping list, and meal plans to provide the service. If you subscribe to Pro, Stripe processes your payment — we never store your card details. We store your member number and subscription status.`
          },
          {
            title: "3. How We Use Your Information",
            body: `We use your email to identify your account and send important service updates. Your recipe and pantry data is stored solely to provide the App's features. We do not sell your personal data to third parties. We do not use your data for advertising purposes.`
          },
          {
            title: "4. AI & Photo Processing",
            body: `When you use the fridge scanning feature, photos are sent to Anthropic's Claude AI API for ingredient identification. Photos are processed in real time and are not stored by Che AF or Anthropic beyond the immediate request. Recipe generation prompts are similarly processed and not retained.`
          },
          {
            title: "5. Data Storage",
            body: `Your data is stored securely using Supabase, a cloud database service with servers located in the United States. Your data is protected by row-level security — only you can access your own data. We use industry-standard encryption for data in transit and at rest.`
          },
          {
            title: "6. Third Party Services",
            body: `We use the following third party services: Supabase (database and authentication), Anthropic Claude API (AI recipe generation), Stripe (payment processing), and Vercel (app hosting). Each service has its own privacy policy governing their use of data.`
          },
          {
            title: "7. Your Rights (NZ Privacy Act 2020)",
            body: `Under the New Zealand Privacy Act 2020, you have the right to access your personal information, request correction of inaccurate information, and request deletion of your account and data. To exercise these rights, email us at support@che-af.vercel.app`
          },
          {
            title: "8. Data Retention",
            body: `We retain your data for as long as your account is active. If you delete your account, your personal data is permanently deleted within 30 days. Recipe photos stored in our cloud storage are deleted immediately upon account deletion.`
          },
          {
            title: "9. Children's Privacy",
            body: `Che AF is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.`
          },
          {
            title: "10. Changes to This Policy",
            body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of the App after changes constitutes acceptance of the updated policy.`
          },
          {
            title: "11. Contact Us",
            body: `For any privacy concerns or requests, contact us at support@che-af.vercel.app. We will respond within 5 business days.`
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#f5f0e8", marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 15, color: "rgba(245,240,232,0.6)", lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
