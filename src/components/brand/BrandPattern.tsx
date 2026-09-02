import React from 'react';

interface BrandPatternProps {
  className?: string;
  opacity?: number;
}

export const BrandPattern: React.FC<BrandPatternProps> = ({
  className = '',
  opacity = 0.25,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
      id="hero-background-pattern"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/*
            Exact Repeating Isometric 3D Y-Shaped / Three-Pronged Geometric Pattern
            Recreated from uploaded reference image:
            - Interlocking 3D Y-blocks with consistent 150° / 30° / 90° isometric angles
            - 3 rectangular arms with top V-faces, side vertical facets, end caps, and center vertical ridge
            - Seamless repeating tiling horizontally (W = 60) and vertically (H = 51.9615)
            - Subtle dark blue / navy stroke lines without gradients or decorative distractions
          */}
          <g id="isometric-y-block">
            {/* Top Plane - Left V-Face */}
            <polygon
              points="-30,-17.3205 0,0 0,8.6603 -20,-2.8868"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Top Plane - Right V-Face */}
            <polygon
              points="0,0 30,-17.3205 20,-2.8868 0,8.6603"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Left Arm End Cap */}
            <polygon
              points="-30,-17.3205 -20,-2.8868 -20,5.7735 -30,-8.6603"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Right Arm End Cap */}
            <polygon
              points="30,-17.3205 20,-2.8868 20,5.7735 30,-8.6603"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Left Vertical Body Facet */}
            <polygon
              points="-20,5.7735 -10,11.547 -10,31.754 0,37.528 0,8.6603 -20,-2.8868"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Right Vertical Body Facet */}
            <polygon
              points="20,5.7735 10,11.547 10,31.754 0,37.528 0,8.6603 20,-2.8868"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Center Vertical Dividing Line */}
            <line
              x1="0"
              y1="8.6603"
              x2="0"
              y2="37.528"
              stroke="#38BDF8"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Full Outer Silhouette */}
            <path
              d="M-30,-17.3205 L0,0 L30,-17.3205 L30,-8.6603 L20,5.7735 L10,11.547 L10,31.754 L0,37.528 L-10,31.754 L-10,11.547 L-20,5.7735 L-30,-8.6603 Z"
              fill="none"
              stroke="#38BDF8"
              strokeOpacity="0.5"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Seamless Repeating Tessellation Grid */}
          <pattern
            id="hero-isometric-y-pattern"
            width="60"
            height="51.9615"
            patternUnits="userSpaceOnUse"
          >
            {/* Base Grid Nodes */}
            <use href="#isometric-y-block" x="0" y="0" />
            <use href="#isometric-y-block" x="60" y="0" />
            <use href="#isometric-y-block" x="0" y="51.9615" />
            <use href="#isometric-y-block" x="60" y="51.9615" />

            {/* Staggered Interlocking Center Node */}
            <use href="#isometric-y-block" x="30" y="25.9808" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#hero-isometric-y-pattern)" />
      </svg>
    </div>
  );
};
