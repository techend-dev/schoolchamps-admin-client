import { useEffect } from 'react';

export default function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)',
            color: '#e5e7eb',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
            {/* Header */}
            <header style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 0',
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: 'bold', color: '#fff',
                    }}>S</div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>SchoolChamps</span>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
                <h1 style={{
                    fontSize: '36px', fontWeight: 800, color: '#fff',
                    marginBottom: '8px', letterSpacing: '-0.03em',
                }}>Privacy Policy</h1>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '40px' }}>
                    Last updated: February 11, 2026
                </p>

                <div style={{ lineHeight: 1.8, fontSize: '15px' }}>
                    <Section title="1. Introduction">
                        <p>
                            Welcome to SchoolChamps ("we," "our," or "us"). SchoolChamps is a content management and social media
                            publishing platform designed to help schools manage their digital presence. We are committed to protecting
                            the privacy and security of your personal information. This Privacy Policy explains how we collect, use,
                            disclose, and safeguard your information when you use our platform at{' '}
                            <a href="https://schoolchamps.in" style={{ color: '#22c55e', textDecoration: 'none' }}>schoolchamps.in</a>.
                        </p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p><strong style={{ color: '#d1d5db' }}>Account Information:</strong> When you register, we collect your name,
                            email address, and role (e.g., admin, writer, marketer).</p>
                        <p><strong style={{ color: '#d1d5db' }}>Content Data:</strong> Blog posts, articles, images, and social media
                            content you create or upload through the platform.</p>
                        <p><strong style={{ color: '#d1d5db' }}>Social Media Tokens:</strong> When you connect social media accounts
                            (Instagram, Facebook, LinkedIn), we securely store OAuth access tokens to enable publishing on your
                            behalf. We do not store your social media passwords.</p>
                        <p><strong style={{ color: '#d1d5db' }}>Usage Data:</strong> We collect analytics data including page views,
                            feature usage, and interaction patterns to improve our service.</p>
                        <p><strong style={{ color: '#d1d5db' }}>Device Information:</strong> Browser type, IP address, and device
                            identifiers for security and service optimization.</p>
                    </Section>

                    <Section title="3. How We Use Your Information">
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>To provide and maintain our content management services</li>
                            <li>To publish content to connected social media platforms (Instagram, Facebook, LinkedIn) on your behalf</li>
                            <li>To generate AI-powered content suggestions and blog drafts</li>
                            <li>To manage user authentication and access control</li>
                            <li>To send notifications about content approvals, publishing status, and platform updates</li>
                            <li>To analyze usage patterns and improve our services</li>
                            <li>To ensure the security and integrity of our platform</li>
                        </ul>
                    </Section>

                    <Section title="4. Social Media Integration">
                        <p>
                            SchoolChamps integrates with third-party social media platforms including Meta (Facebook, Instagram)
                            and LinkedIn. When you connect these accounts:
                        </p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>We request only the minimum permissions necessary to publish content</li>
                            <li>Access tokens are stored securely in our encrypted database</li>
                            <li>We automatically refresh tokens to maintain connectivity</li>
                            <li>You can disconnect any social media account at any time through Settings</li>
                            <li>We do not read your private messages, friend lists, or personal social media content</li>
                        </ul>
                        <p>
                            For Facebook and Instagram, we use the Meta Graph API with permissions limited to
                            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                                pages_manage_posts
                            </code>,{' '}
                            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                                instagram_content_publish
                            </code>, and related read permissions.
                        </p>
                    </Section>

                    <Section title="5. Data Sharing and Disclosure">
                        <p>We do not sell, rent, or trade your personal information. We may share data with:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li><strong style={{ color: '#d1d5db' }}>Social Media Platforms:</strong> Content you choose to publish is sent to the connected platforms via their APIs</li>
                            <li><strong style={{ color: '#d1d5db' }}>AI Services:</strong> Content data is sent to Google Gemini AI for generating blog drafts and social media posts (no personal data is shared)</li>
                            <li><strong style={{ color: '#d1d5db' }}>WordPress:</strong> Published blogs are synced to your WordPress site if configured</li>
                            <li><strong style={{ color: '#d1d5db' }}>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Security">
                        <p>
                            We implement industry-standard security measures to protect your data, including:
                        </p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>HTTPS encryption for all data in transit</li>
                            <li>Secure token storage with encryption at rest</li>
                            <li>Role-based access control (Admin, Writer, Marketer, School)</li>
                            <li>JWT-based session management with configurable expiration</li>
                            <li>Regular security audits and vulnerability assessments</li>
                        </ul>
                    </Section>

                    <Section title="7. Data Retention">
                        <p>
                            We retain your personal data for as long as your account is active or as needed to provide
                            our services. Social media tokens are automatically refreshed and old tokens are replaced.
                            You may request deletion of your account and associated data at any time by contacting us.
                        </p>
                    </Section>

                    <Section title="8. Your Rights">
                        <p>You have the right to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Access and review the personal data we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data ("right to be forgotten")</li>
                            <li>Disconnect social media accounts at any time</li>
                            <li>Export your content data</li>
                            <li>Withdraw consent for data processing</li>
                        </ul>
                    </Section>

                    <Section title="9. Cookies and Tracking">
                        <p>
                            We use essential cookies for authentication and session management. We do not use
                            third-party advertising cookies or cross-site tracking technologies.
                        </p>
                    </Section>

                    <Section title="10. Children's Privacy">
                        <p>
                            SchoolChamps is designed for use by school administrators, content writers, and marketers.
                            We do not knowingly collect personal information from children under 13 years of age.
                            If you believe a child has provided us with personal data, please contact us immediately.
                        </p>
                    </Section>

                    <Section title="11. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material
                            changes by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p>
                            If you have any questions about this Privacy Policy or our data practices,
                            please contact us at:
                        </p>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '20px', marginTop: '12px',
                        }}>
                            <p style={{ margin: '4px 0' }}><strong style={{ color: '#fff' }}>SchoolChamps</strong></p>
                            <p style={{ margin: '4px 0' }}>
                                Email:{' '}
                                <a href="mailto:support@schoolchamps.in" style={{ color: '#22c55e', textDecoration: 'none' }}>
                                    support@schoolchamps.in
                                </a>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                Website:{' '}
                                <a href="https://schoolchamps.in" style={{ color: '#22c55e', textDecoration: 'none' }}>
                                    schoolchamps.in
                                </a>
                            </p>
                        </div>
                    </Section>

                    <Section title="13. Data Deletion">
                        <p>
                            To request deletion of your data, including any data collected via Facebook or Instagram
                            integrations, please email us at{' '}
                            <a href="mailto:support@schoolchamps.in" style={{ color: '#22c55e', textDecoration: 'none' }}>
                                support@schoolchamps.in
                            </a>
                            . We will process your request within 30 days and confirm deletion.
                            You may also disconnect your social media accounts at any time from the Settings page
                            to stop data processing immediately.
                        </p>
                    </Section>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '24px 0',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '13px',
            }}>
                <p>© {new Date().getFullYear()} SchoolChamps. All rights reserved.</p>
            </footer>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section style={{ marginBottom: '32px' }}>
            <h2 style={{
                fontSize: '20px', fontWeight: 700, color: '#fff',
                marginBottom: '12px', letterSpacing: '-0.01em',
                paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>{title}</h2>
            <div style={{ color: '#9ca3af' }}>{children}</div>
        </section>
    );
}
