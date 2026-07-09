export default function ErrMsg({ msg }) {
  if (!msg) return null
  return <div style={{ fontSize: 11, color: 'var(--rose-500)', marginTop: 4, fontWeight: 500 }}>{msg}</div>
}
