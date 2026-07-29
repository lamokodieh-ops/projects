export function Input({ id, label, hint, className = '', ...rest }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input id={id} className="field__input" {...rest} />
      {hint ? <p className="field__hint muted">{hint}</p> : null}
    </div>
  );
}
