export const metadata = {
  title: "KSA-Connect - Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ maxWidth: 760, padding: "40px 24px 80px" }}>
      <h1 style={{ color: "var(--ink)" }}>KSA-Connect - Privacy Policy</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Last updated: August 2026</p>

      <p>
        KSA-Connect (formerly RiyadhConnect), developed by MOA Apps Developer&apos;s, is a
        classifieds and community app for residents and expatriates across Saudi Arabia
        (Riyadh, Jeddah, Dammam, Khobar, Jubail, Yanbu, and Madina). This policy explains what
        information we collect, how we use it, and the choices you have.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> name, email address, phone number, and profile
          photo, provided when you sign up (including via Google Sign-In).
        </li>
        <li>
          <strong>Listings &amp; classifieds content:</strong> details, photos, and location you
          choose to include when posting a listing or classified ad.
        </li>
        <li>
          <strong>Matrimonial profile information:</strong> if you use the matrimonial feature,
          information you choose to share such as preferences, family/guardian (Wali) details,
          and interest requests. This information is sensitive and is only shared with users you
          or your approved matches interact with, subject to admin approval where applicable.
        </li>
        <li>
          <strong>Chat &amp; messages:</strong> text messages and photos you send through in-app
          chat with other users.
        </li>
        <li>
          <strong>Location data:</strong> your selected city and, where permitted, approximate
          location, used to show relevant local listings.
        </li>
        <li>
          <strong>Device &amp; usage data:</strong> basic technical information and
          push-notification tokens, used to deliver notifications and maintain app performance.
        </li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To create and display your listings, classifieds, and matrimonial profile.</li>
        <li>To enable in-app chat between users.</li>
        <li>To send push notifications relevant to your activity.</li>
        <li>To show content relevant to your selected city.</li>
        <li>To maintain the safety and integrity of the platform.</li>
      </ul>

      <h2>Data Sharing</h2>
      <p>
        We do not sell your personal information. Information you post publicly is visible to
        other app users. Matrimonial profile details and chat messages are only visible to the
        specific users involved, and to app administrators where review or moderation is
        required.
      </p>

      <h2>Data Security</h2>
      <p>
        We use Google Firebase (Authentication, Cloud Firestore, Cloud Storage, Cloud Messaging)
        to store and manage your data, with industry-standard encryption in transit and at rest.
      </p>

      <h2>Third-Party Services</h2>
      <ul>
        <li>Google Firebase (Authentication, Firestore, Storage, Cloud Messaging)</li>
        <li>Google Sign-In</li>
      </ul>

      <h2>Your Choices &amp; Rights</h2>
      <ul>
        <li>Edit or delete your listings and matrimonial profile any time from the app.</li>
        <li>Request account/data deletion by contacting us below.</li>
        <li>Block or report other users directly from the app.</li>
      </ul>

      <h2>Children&apos;s Privacy</h2>
      <p>
        KSA-Connect is not directed at children under 13, and we do not knowingly collect
        personal information from children under 13.
      </p>

      <h2>Contact Us</h2>
      <p>
        MOA Apps Developer&apos;s
        <br />
        Email: <a href="mailto:abuman.moa@gmail.com">abuman.moa@gmail.com</a>
      </p>
    </main>
  );
}
