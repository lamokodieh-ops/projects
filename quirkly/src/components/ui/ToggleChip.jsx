export function ToggleChip({ selected, onToggle, children }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={`chip ${selected ? 'chip--on' : ''}`}
      onClick={() => onToggle(!selected)}
    >
      {children}
    </button>
  );
}
