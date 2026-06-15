import { useState } from "react";

interface Props {
  value: number;        // 0–5, múltiplo de 0.5
  onChange?: (v: number) => void; // omitir = modo leitura
  size?: number;        // px
}

export default function StarRating({ value, onChange, size = 22 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hover ?? value;

  function scoreAt(star: number, e: React.MouseEvent<HTMLSpanElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = (e.clientX - rect.left) < rect.width / 2;
    return half ? star - 0.5 : star;
  }

  return (
    <span
      style={{ display: "inline-flex", gap: 2, cursor: interactive ? "pointer" : "default" }}
      onMouseLeave={() => interactive && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = display >= star ? 1 : display >= star - 0.5 ? 0.5 : 0;
        return (
          <span
            key={star}
            style={{ position: "relative", width: size, height: size, display: "inline-block" }}
            onMouseMove={interactive ? (e) => setHover(scoreAt(star, e)) : undefined}
            onClick={interactive ? (e) => onChange!(scoreAt(star, e)) : undefined}
          >
            {/* estrela vazia (cinza) */}
            <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute" }}>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#e5e7eb"
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            </svg>
            {/* estrela preenchida (dourada), clipada pela porcentagem de fill */}
            {fill > 0 && (
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                style={{
                  position: "absolute",
                  clipPath: fill === 1 ? "none" : "inset(0 50% 0 0)",
                }}
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#f59e0b"
                  stroke="#f59e0b"
                  strokeWidth={1}
                />
              </svg>
            )}
          </span>
        );
      })}
    </span>
  );
}
