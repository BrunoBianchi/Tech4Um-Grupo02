export default function ForumCard({ title, description, author, replies, highlight }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "16px",
        backgroundColor: "#fff",
      }}
    >
      {highlight && (
        <p style={{ color: "orange", fontWeight: "bold" }}>Tópico em destaque!</p>
      )}

      <h2 style={{ fontSize: "20px", color: "#007bff" }}>{title}</h2>

      {description && (
        <p style={{ color: "#444", fontSize: "14px", marginTop: "8px" }}>
          {description}
        </p>
      )}

      <p style={{ color: "#777", fontSize: "12px", marginTop: "12px" }}>
        Criado por: <strong>{author}</strong>
      </p>

      <p style={{ color: "#777", fontSize: "12px" }}>{replies} respostas</p>
    </div>
  );
}
