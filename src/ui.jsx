import { useEffect, useId, useRef } from 'react';

export const asset = name => import.meta.env.BASE_URL + name;
const glyphs = {
  home: 'm3 10 9-7 9 7v10h-6v-6H9v6H3z', building: 'M4 21V3h16v18M2 21h20M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-5h4v5',
  ticket: 'M4 5h16v12H9l-5 4zM8 9h8m-8 4h5', calendar: 'M4 5h16v15H4zm0 5h16M8 3v4m8-4v4',
  person: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  pass: 'M3 6h18v13H3zM7 10h4m-4 4h7m3-3h1', doc: 'M5 3h9l5 5v13H5zM14 3v6h5m-10 5h6m-6 3h6',
  stack: 'm3 8 9-5 9 5-9 5zm0 4 9 5 9-5m-18 4 9 5 9-5', bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3a2 2 0 0 0 4 0',
  logout: 'm10 16 4-4-4-4m4 4H3m13-8h5v16h-5', arrow: 'M4 12h15m-6-6 6 6-6 6',
  left: 'm14 5-7 7 7 7', right: 'm9 5 7 7-7 7', plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M18 6 6 18',
  menu: 'M4 6h16M4 12h16M4 18h16', search: 'm20 20-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z', clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  pin: 'M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  checks: 'm4 12 4 4L20 5M4 19h16', parking: 'M3 3h18v18H3zm6 14V7h5a3 3 0 0 1 0 6H9',
  gear: 'M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z',
};
export function Icon({ name, size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[name]} /></svg>;
}

export function Brand({ onClick, compact = false }) {
  return <button className="brand" onClick={onClick} type="button" aria-label="Меридиан — публичная страница">
    <svg viewBox="0 0 48 42" width="39" height="34" aria-hidden="true" fill="currentColor">
      <path d="M2 19 10 14V39H2zM12 12 28 2v37h-8V17zM37 7 47 13v26H37z" />
    </svg><span aria-hidden={compact}>Меридиан</span>
  </button>;
}
export function Button({ children, icon, variant = 'primary', type = 'button', className = '', ...props }) {
  return <button type={type} className={`button button--${variant} ${className}`} {...props}>{icon && <Icon name={icon} />}{children}</button>;
}
export function Badge({ children }) {
  const tone = ['Активен', 'Внутри', 'Подтверждена', 'Принято', 'Закрыта'].includes(children) ? 'good'
    : ['Отозван', 'Отменена', 'Занято'].includes(children) ? 'blocked'
      : ['Назначена', 'В работе', 'Ожидает', 'Ожидается'].includes(children) ? 'waiting' : '';
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Tabs({ values, value, onChange, label = 'Вкладки' }) {
  return <div className="tabs" role="group" aria-label={label}>
    {values.map(item => {
      const [id, text] = typeof item === 'string' ? [item, item] : item;
      return <button type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}>{text}</button>;
    })}
  </div>;
}
export function Modal({ title, eyebrow, onClose, children, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} className={wide ? 'dialog dialog--wide' : 'dialog'} onCancel={event => {
    event.preventDefault();
    onClose();
  }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <div className="dialog-head">
      <div>{eyebrow && <p className="kicker">{eyebrow}</p>}<h2 id={titleId}>{title}</h2></div>
      <Button variant="quiet" icon="close" aria-label="Закрыть" onClick={onClose} />
    </div>
    {children}
  </dialog>;
}
export function Confirm({ title, text, label, onClose, onConfirm }) {
  return <Modal title={title} onClose={onClose}>
    <p>{text}</p><div className="actions"><Button variant="outline" onClick={onClose}>Назад</Button><Button onClick={onConfirm}>{label}</Button></div>
  </Modal>;
}
export function DetailList({ items }) {
  return <dl className="facts">{items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}
export function Outside({ items }) {
  return <div className="outside"><strong>Вне демо</strong><ul>{items.map(item => <li key={item}><Icon name="gear" size={14} />{item}</li>)}</ul></div>;
}
export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}
