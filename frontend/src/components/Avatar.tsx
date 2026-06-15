const FALLBACK: Record<"PATIENT" | "CLINIC", string> = {
  PATIENT: "/UsuarioSemFotoPerfil.jpg",
  CLINIC: "/ClinicaSemFotoPerfil.jpg",
};

interface Props {
  src?: string | null;
  type: "PATIENT" | "CLINIC";
  size?: number;
}

export default function Avatar({ src, type, size = 48 }: Props) {
  return (
    <img
      className="avatar"
      src={src || FALLBACK[type]}
      alt=""
      style={{ width: size, height: size }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK[type]; }}
    />
  );
}
