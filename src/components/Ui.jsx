import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Field({ label, error, hint, ...props }) {
  return (
    <label className={`field ${error ? 'field-error' : ''}`}>
      <span className="field-label">{label}</span>
      <input {...props} />
      {error ? <span className="field-message error-message"><AlertCircle size={13} />{error}</span> : hint ? <span className="field-message">{hint}</span> : null}
    </label>
  );
}

export function SelectField({ label, error, children, ...props }) {
  return (
    <label className={`field ${error ? 'field-error' : ''}`}>
      <span className="field-label">{label}</span>
      <select {...props}>{children}</select>
      {error && <span className="field-message error-message"><AlertCircle size={13} />{error}</span>}
    </label>
  );
}

export function FormHeading({ eyebrow = 'REGISTRATION', title, description }) {
  return <div className="form-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>;
}

export function FormActions({ back, children, disabled }) {
  return <div className="form-actions">{back ? <Link to={back} className="button button-quiet"><ArrowLeft size={16} />Back</Link> : <span />}{children || <button className="button button-primary" type="submit" disabled={disabled}>Continue <ArrowRight size={16} /></button>}</div>;
}

export function AddedList({ items, onRemove, title, emptyText, renderItem }) {
  return (
    <div className="added-list">
      <div className="list-heading"><strong>{title}</strong><span>{items.length} added</span></div>
      {items.length === 0 ? <div className="empty-inline">{emptyText}</div> : items.map((item) => (
        <div className="added-row" key={item.id}>
          {renderItem(item)}
          <button type="button" className="icon-button remove-button" onClick={() => onRemove(item.id)} aria-label="Remove item"><Trash2 size={15} /></button>
        </div>
      ))}
    </div>
  );
}

export function AddButton({ children = 'Add item' }) {
  return <button type="submit" className="button button-outline"><Plus size={16} />{children}</button>;
}

export function SuccessIcon() {
  return <span className="success-icon"><Check size={26} /></span>;
}

export function Notice({ children }) {
  return <div className="notice"><CheckCircle2 size={16} />{children}</div>;
}