export function Textarea({ id, label, hint, className = '', ...rest }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea id={id} className="field__input field__textarea" rows={4} {...rest} />
      {hint ? <p className="field__hint muted">{hint}</p> : null}
    </div>
  );
}
