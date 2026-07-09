export default function PatientImages({ patient }) {
  const images = patient.images || patient.attachments || [];

  if (!images.length) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 8
      }}>
        الصور والمرفقات
      </div>
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }}>
        {images.map((img, i) => {

          const url = img?.secure_url || img?.url || img;

          return (
            <a
              key={img?._id || img?.public_id || i}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={url}
                alt={img?.caption || 'مرفق المريض'}
                style={{
                  width: 72,
                  height: 72,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}