import React from 'react';

export interface FereshtehStorePatternProps {
  className?: string;
  color?: string;
  opacity?: number;
  scale?: number;
}

/**
 * FereshtehStorePattern
 * 
 * Recreates the authentic physical store visual identity pattern for Fereshteh Coin & Gold:
 * - High-precision vector SVG geometric interlocking motif matching the store interior partition/wall
 * - Isometric 120° / 60° angles with concentric hexagonal chevrons and three-pronged interlocking labyrinths
 * - 100% mathematically seamless horizontal and vertical repeating tiling
 * - Fully responsive, scalable, and lightweight (zero external assets or bitmap dependencies)
 * - Configurable color, opacity, and scale props
 */
export const FereshtehStorePattern: React.FC<FereshtehStorePatternProps> = ({
  className = '',
  color = '#0B3D60',
  opacity = 0.28,
  scale = 1,
}) => {
  // Base tile dimensions for a luxurious, clearly legible scale
  const baseWidth = 110;
  const baseHeight = 190.5256; // baseWidth * Math.sqrt(3)

  const tileW = Number((baseWidth * scale).toFixed(2));
  const tileH = Number((baseHeight * scale).toFixed(2));
  const halfW = Number((tileW / 2).toFixed(2));
  const halfH = Number((tileH / 2).toFixed(2));

  // Stroke width scaled proportionally with a refined baseline
  const strokeW = Number((2 * scale).toFixed(2));

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
      id="fereshteh-hero-store-pattern"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Reusable geometric store unit cell centered at (0, 0) */}
          <g id="fereshteh-store-unit" transform={`scale(${scale})`}>
            {/* 1. Core Regular Hexagon (the signature store geometric anchor) */}
            <polygon
              points="-7,-12.1244 7,-12.1244 14,0 7,12.1244 -7,12.1244 -14,0"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Subtle inner facet accent to emphasize the luxury jewelry craftsmanship */}
            <polygon
              points="-3.5,-6.0622 3.5,-6.0622 7,0 3.5,6.0622 -3.5,6.0622 -7,0"
              fill="none"
              stroke={color}
              strokeWidth={Number((strokeW * 0.7).toFixed(2))}
              strokeOpacity="0.4"
              strokeLinejoin="round"
            />

            {/* 2. Concentric Hexagonal Ribbon Layer 1 */}
            <polygon
              points="-13,-22.5167 13,-22.5167 26,0 13,22.5167 -13,22.5167 -26,0"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* 3. Concentric Hexagonal Ribbon Layer 2 */}
            <polygon
              points="-20,-34.641 20,-34.641 40,0 20,34.641 -20,34.641 -40,0"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* 4. Tangential Interlocking Pinwheel Arms (creating the continuous store maze) */}
            {/* Top horizontal arm running right */}
            <path
              d="M13,-22.5167 L38,-22.5167 M20,-34.641 L50,-34.641"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Bottom horizontal arm running left */}
            <path
              d="M-13,22.5167 L-38,22.5167 M-20,34.641 L-50,34.641"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Upper-right 60° diagonal arm running up-right */}
            <path
              d="M26,0 L38.5,-21.6506 M40,0 L55,-25.9808"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Lower-left 240° diagonal arm running down-left */}
            <path
              d="M-26,0 L-38.5,21.6506 M-40,0 L-55,25.9808"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Upper-left 120° diagonal arm running up-left */}
            <path
              d="M-13,-22.5167 L-25.5,-44.1673 M-20,-34.641 L-35,-60.6218"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Lower-right 300° diagonal arm running down-right */}
            <path
              d="M13,22.5167 L25.5,44.1673 M20,34.641 L35,60.6218"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* 5. Interlocking 3-Pronged Y-Joint Connectors */}
            {/* Top-Right Y junction */}
            <path
              d="M38,-22.5167 L44,-12.1244 L55,-12.1244"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Bottom-Left Y junction */}
            <path
              d="M-38,22.5167 L-44,12.1244 L-55,12.1244"
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* 100% Mathematically Seamless Hexagonal Tessellation Pattern */}
          <pattern
            id="fereshteh-store-pattern"
            width={tileW}
            height={tileH}
            patternUnits="userSpaceOnUse"
          >
            {/* 4 Corner Nodes for perfect edge continuity */}
            <use href="#fereshteh-store-unit" x={0} y={0} />
            <use href="#fereshteh-store-unit" x={tileW} y={0} />
            <use href="#fereshteh-store-unit" x={0} y={tileH} />
            <use href="#fereshteh-store-unit" x={tileW} y={tileH} />

            {/* Center Interlocking Staggered Node */}
            <use href="#fereshteh-store-unit" x={halfW} y={halfH} />
          </pattern>
        </defs>

        {/* Seamless fill across the entire container */}
        <rect
          width="100%"
          height="100%"
          fill="url(#fereshteh-store-pattern)"
        />
      </svg>
    </div>
  );
};
