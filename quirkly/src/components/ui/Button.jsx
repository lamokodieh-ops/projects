export function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  ...rest
}) {
  const v = variant === 'ghost' ? 'btn btn--ghost' : variant === 'secondary' ? 'btn btn--secondary' : 'btn btn--primary';
  return (
    <button type={type} className={`${v} ${className}`.trim()} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
