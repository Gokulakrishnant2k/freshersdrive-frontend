export default function WhatsAppButton() {
  return (
    <div style={styles.wrapper} className="fd-whatsapp-wrap">
      <span style={styles.tooltip} className="fd-whatsapp-tooltip">
        Join Hiring Updates
      </span>

      <a
        href="https://chat.whatsapp.com/YOUR_GROUP_LINK"
        target="_blank"
        rel="noreferrer"
        style={styles.floatingBtn}
        className="fd-whatsapp-btn"
      >
        💬
      </a>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },

  tooltip: {
    background: "#111827",
    color: "white",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    opacity: 0.9,
    animation: "fadeIn 0.3s ease-in-out",
  },

  floatingBtn: {
    width: "52px",
    height: "52px",
    background: "#25D366",
    color: "white",
    borderRadius: "50%",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    animation: "pulse 2s infinite",
  },
};