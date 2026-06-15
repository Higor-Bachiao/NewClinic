import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { useAuth } from "../auth";
import { ClinicReviews as ClinicReviewsData } from "../types";
import StarRating from "../components/StarRating";
import Avatar from "../components/Avatar";

export default function ClinicReviews() {
  const { user } = useAuth();
  const [data, setData] = useState<ClinicReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`/clinics/${user!.id}/reviews`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="muted">Carregando...</p>;
  if (!data) return null;

  return (
    <div>
      <h2>Avaliações</h2>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#f59e0b", lineHeight: 1 }}>
            {data.avg !== null ? data.avg.toFixed(1) : "—"}
          </div>
          <div style={{ marginTop: 6 }}>
            <StarRating value={data.avg ?? 0} size={22} />
          </div>
          <div className="muted" style={{ marginTop: 4 }}>
            {data.total} {data.total === 1 ? "avaliação" : "avaliações"}
          </div>
        </div>
      </div>

      {data.total === 0 ? (
        <p className="muted">Nenhuma avaliação ainda.</p>
      ) : (
        data.reviews.map((r) => (
          <div className="card" key={r.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Avatar src={r.patient.photoUrl} type="PATIENT" size={36} />
              <div>
                <strong style={{ fontSize: 14 }}>{r.patient.fullName}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <StarRating value={r.rating} size={18} />
                <span className="muted" style={{ marginLeft: 6, fontSize: 13 }}>{r.rating}</span>
              </div>
            </div>
            {r.comment && <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{r.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}
