import { useEffect, useRef } from 'react';

export default function ContextMenu({ items, position, onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const keyHandler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  const style = {
    top: Math.min(position.y, window.innerHeight - 240),
    left: Math.min(position.x, window.innerWidth - 220),
  };

  return (
    <div className="context-menu" ref={ref} style={style}>
      {items.map((item, i) =>
        item === 'divider' ? (
          <div key={i} className="context-divider" />
        ) : (
          <button
            key={i}
            className={`context-item ${item.danger ? 'danger' : ''}`}
            onClick={() => { item.action(); onClose(); }}
            id={`ctx-item-${i}`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
