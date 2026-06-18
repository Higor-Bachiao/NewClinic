import { useEffect, useState } from "react";
import { apiGet, apiUploadSend, assetUrl } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";
import Icon from "../components/Icon";

const SPECIALTIES = [
  "Dermatologista",
  "Cardiologista",
  "Ortopedista",
  "Oftalmologista",
  "Pediatra",
  "Psicologo",
  "Nutricionista",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Profile() {
  const { user, login } = useAuth();
  const toast = useToast();
  const isClinic = user?.role === "CLINIC";

  const [form, setForm] = useState<Record<string, string>>({});
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet("/profile/me")
      .then((data) => {
        setCurrentPhoto(data.photoUrl || null);
        if (data.role === "PATIENT") {
          setForm({
            fullName: data.fullName || "",
            username: data.username || "",
            cpf: data.cpf || "",
            email: data.email || "",
          });
        } else {
          setForm({
            clinicName: data.clinicName || "",
            ownerName: data.ownerName || "",
            cnpj: data.cnpj || "",
            specialty: data.specialty || SPECIALTIES[0],
            email: data.email || "",
          });
        }
      })
      .catch((err) => toast.error((err as Error).message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function onPickPhoto(file: File | null) {
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function validate() {
    const e: Record<string, string> = {};
    const required = isClinic
      ? [
          { k: "clinicName", l: "nome da clinica" },
          { k: "ownerName", l: "nome do dono" },
          { k: "cnpj", l: "CNPJ" },
        ]
      : [
          { k: "fullName", l: "nome completo" },
          { k: "username", l: "username" },
          { k: "cpf", l: "CPF" },
        ];
    for (const f of required) {
      if (!form[f.k]?.trim()) e[f.k] = `Informe ${f.l}.`;
    }
    if (!form.email?.trim()) e.email = "Informe o email.";
    else if (!EMAIL_RE.test(form.email)) e.email = "Email invalido.";

    // Senha so e validada se o usuario quiser troca-la
    if (form.password || form.confirmPassword) {
      if ((form.password || "").length < 6) e.password = "A senha precisa ter ao menos 6 caracteres.";
      if (form.password !== form.confirmPassword) e.confirmPassword = "As senhas nao conferem.";
    }
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.warning("Corrija os campos destacados.");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      // Nao envia senha vazia
      if ((k === "password" || k === "confirmPassword") && !v) return;
      fd.append(k, v);
    });
    if (photo) fd.append("photo", photo);

    try {
      const data = await apiUploadSend("/profile/me", "PUT", fd);
      login(data.token, data.user); // atualiza nome/foto na navbar
      setCurrentPhoto(data.user.photoUrl || null);
      setPhoto(null);
      setPreview(null);
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Carregando...</p>;

  const photoSrc = preview || assetUrl(currentPhoto) || "";

  return (
    <div>
      <h2>Meu Perfil</h2>

      <form className="card" onSubmit={handleSubmit} noValidate>
        <div className="profile-photo">
          {photoSrc ? (
            <img className="profile-avatar" src={photoSrc} alt="Foto de perfil" />
          ) : (
            <div className="profile-avatar placeholder">
              <Icon name="person" size={48} />
            </div>
          )}
          <label className="btn secondary photo-btn">
            <Icon name="photo_camera" size={18} />
            Alterar foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPickPhoto(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {isClinic ? (
          <>
            <Field label="Nome da Clinica" k="clinicName" form={form} set={set} error={errors.clinicName} />
            <Field label="Nome do Dono" k="ownerName" form={form} set={set} error={errors.ownerName} />
            <Field label="CNPJ" k="cnpj" form={form} set={set} error={errors.cnpj} />
            <div className="field">
              <label>Especialidade</label>
              <select value={form.specialty} onChange={(e) => set("specialty", e.target.value)}>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <Field label="Nome Completo" k="fullName" form={form} set={set} error={errors.fullName} />
            <Field label="Username" k="username" form={form} set={set} error={errors.username} />
            <Field label="CPF" k="cpf" form={form} set={set} error={errors.cpf} />
          </>
        )}

        <Field label="Email" k="email" type="email" form={form} set={set} error={errors.email} />

        <hr className="divider" />
        <p className="muted" style={{ marginTop: 0 }}>
          Deixe os campos abaixo em branco para manter a senha atual.
        </p>
        <Field label="Nova Senha" k="password" type="password" form={form} set={set} error={errors.password} />
        <Field
          label="Confirmar Nova Senha"
          k="confirmPassword"
          type="password"
          form={form}
          set={set}
          error={errors.confirmPassword}
        />

        <button className="btn success" disabled={saving} style={{ marginTop: 8 }}>
          <Icon name="save" size={18} />
          {saving ? "Salvando..." : "Salvar alteracoes"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  k,
  type = "text",
  form,
  set,
  error,
}: {
  label: string;
  k: string;
  type?: string;
  form: Record<string, string>;
  set: (k: string, v: string) => void;
  error?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        className={error ? "invalid" : ""}
        value={form[k] || ""}
        onChange={(e) => set(k, e.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
