import React from "react";

const Footer = () => (
    <footer style={styles.footer}>
        <div style={styles.container}>
            <div style={styles.brand}>
                <span style={styles.logo}>EVENTIX</span>
                <p style={styles.text}>
                    Modern ticketing experience for your next event.
                </p>
            </div>

            <div style={styles.links}>
                <div style={styles.linkGroup}>
                    <h4 style={styles.heading}>Company</h4>
                    <a style={styles.link} href="#about">About</a>
                    <a style={styles.link} href="#careers">Careers</a>
                    <a style={styles.link} href="#contact">Contact</a>
                </div>

                <div style={styles.linkGroup}>
                    <h4 style={styles.heading}>Resources</h4>
                    <a style={styles.link} href="#support">Support</a>
                    <a style={styles.link} href="#blog">Blog</a>
                    <a style={styles.link} href="#faq">FAQ</a>
                </div>
            </div>
        </div>

        <div style={styles.bottom}>
            <span>© {new Date().getFullYear()} EVENTIX. All rights reserved.</span>
            <div style={styles.social}>
                <a style={styles.socialLink} href="#twitter">Twitter</a>
                <a style={styles.socialLink} href="#linkedin">LinkedIn</a>
                <a style={styles.socialLink} href="#instagram">Instagram</a>
            </div>
        </div>
    </footer>
);

const styles = {
    footer: {
        background: "#111827",
        color: "#e5e7eb",
        padding: "40px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
    },
    container: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "32px",
        maxWidth: "1120px",
        margin: "0 auto",
    },
    brand: {
        minWidth: "220px",
        flex: "1",
    },
    logo: {
        display: "inline-block",
        fontSize: "24px",
        fontWeight: "700",
        color: "#fff",
        marginBottom: "12px",
    },
    text: {
        lineHeight: "1.8",
        maxWidth: "320px",
        color: "#9ca3af",
    },
    links: {
        display: "flex",
        gap: "48px",
        flex: "1",
        minWidth: "240px",
    },
    linkGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    heading: {
        fontSize: "14px",
        color: "#f3f4f6",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "12px",
    },
    link: {
        color: "#9ca3af",
        textDecoration: "none",
        transition: "color 0.2s ease",
    },
    bottom: {
        borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        marginTop: "32px",
        paddingTop: "24px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "16px",
        maxWidth: "1120px",
        margin: "32px auto 0",
        color: "#9ca3af",
        fontSize: "14px",
    },
    social: {
        display: "flex",
        gap: "16px",
    },
    socialLink: {
        color: "#9ca3af",
        textDecoration: "none",
        transition: "color 0.2s ease",
    },
};

export default Footer;