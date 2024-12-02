import React, { useState, useRef, useEffect } from 'react';
import './InfoTooltip.css';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, position = 'bottom' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="tooltip-container" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="tooltip-trigger"
      >
        <img
          src="/info_icon.png"
          alt="Info"
          className="info-icon"
          style={{ filter: 'invert(0.5)' }}
        />
      </button>

      {isOpen && (
        <div className={`tooltip-popup position-${position}`}>
          <div className="tooltip-content">
            <div className="tooltip-header">
              <button
                onClick={() => setIsOpen(false)}
                className="close-button"
              >
                [x]
              </button>
              <div className="tooltip-text">{content}</div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;