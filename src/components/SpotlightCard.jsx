import { useRef } from 'react';
import './SpotlightCard.css';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {
  const divRef = useRef(null);

  const updatePointer = e => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const resetPointer = () => {
    if (!divRef.current) return;
    divRef.current.style.setProperty('--mouse-x', '50%');
    divRef.current.style.setProperty('--mouse-y', '50%');
  };

  return (
    <div
      ref={divRef}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
      className={`card-spotlight ${className}`}
      style={{ '--spotlight-color': spotlightColor }}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
