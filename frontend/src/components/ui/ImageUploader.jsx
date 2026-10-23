import { useEffect, useId, useMemo, useRef, useState } from 'react';

const IMAGE_TYPES =['image/png', 'image/jpeg', 'image/webp'];
const ACCEPT = IMAGE_TYPES.join(',');
const MAX_SIZE_MB = 5;

const sameFile = (a, b) => a.name === b.name && a.size === b.size;

/**
 * Selector de imágenes múltiple con arrastrar y soltar y miniaturas.
 * Componente controlado: el padre guarda los archivos y se los pasa en `files`.
 * - files: array de File ya elegidos.
 * - onChange(files): recibe la lista nueva (al agregar o quitar).
 * - max: cantidad máxima de archivos (por defecto 5).
 * - existing: URLs de imágenes ya guardadas (solo se muestran, no se suben de nuevo).
 * - disabled: bloquea el selector mientras se guarda.
 */
export default function ImageUploader({ files, onChange, max = 5, existing = [], disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('');

  // Miniaturas: se generan una vez por lista de archivos y se liberan al cambiar o desmontar.
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const addFiles = (incoming) => {
    const valid = [];
    const problems = [];
    for (const file of Array.from(incoming)) {
      if (!IMAGE_TYPES.includes(file.type)) {
        problems.push(`«${file.name}» no es .png, .jpg o .webp.`);
      } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        problems.push(`«${file.name}» pesa más de ${MAX_SIZE_MB} MB.`);
      } else if (files.some((f) => sameFile(f, file)) || valid.some((f) => sameFile(f, file))) {
        problems.push(`«${file.name}» ya está en la lista.`);
      } else {
        valid.push(file);
      }
    }
    const room = Math.max(max - files.length, 0);
    if (valid.length > room) {
      problems.push(`Podés cargar hasta ${max} fotos. Se agregaron ${room}.`);
    }
    setMessage(problems.join(' '));
    if (valid.length > 0 && room > 0) onChange([...files, ...valid.slice(0, room)]);
  };

  const handleInput = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // permite volver a elegir el mismo archivo
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  const removeAt = (index) => {
    setMessage('');
    onChange(files.filter((_, i) => i !== index));
  };

  const full = files.length >= max;

  return (
    <div className="image-uploader">
      <div
        className={`image-uploader__drop${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="image-uploader__input"
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleInput}
          disabled={disabled || full}
          tabIndex={-1}
          aria-describedby={`${inputId}-help`}
        />
        <p className="image-uploader__text">Arrastrá las fotos acá o</p>
        <button
          type="button"
          className="btn btn--sm image-uploader__pick"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || full}
          aria-describedby={`${inputId}-help`}
        >
          Elegir fotos
        </button>
        <p id={`${inputId}-help`} className="image-uploader__help">
          .png, .jpg o .webp · hasta {max} fotos de {MAX_SIZE_MB} MB · {files.length} de {max} elegidas
        </p>
      </div>

      {message && <p className="form-error" role="alert">⚠ {message}</p>}

      {(previews.length > 0 || existing.length > 0) && (
        <ul className="image-uploader__list" aria-label="Fotos del producto">
          {existing.map((url, i) => (
            <li key={url} className="image-uploader__item">
              <img src={url} alt={`Foto actual ${i + 1}`} className="image-uploader__thumb" />
              <span className="image-uploader__badge">Actual</span>
            </li>
          ))}
          {previews.map(({ file, url }, i) => (
            <li key={`${file.name}-${file.size}`} className="image-uploader__item">
              <img src={url} alt={`Vista previa de ${file.name}`} className="image-uploader__thumb" />
              {i === 0 && existing.length === 0 && <span className="image-uploader__badge">Principal</span>}
              <button
                type="button"
                className="image-uploader__remove"
                onClick={() => removeAt(i)}
                disabled={disabled}
                aria-label={`Quitar ${file.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
