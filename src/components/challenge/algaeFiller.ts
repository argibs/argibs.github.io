const SVG = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="algaeGradient">
                <stop offset="0%" stop-color="#27ae60" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#16a085" stop-opacity="0.3"/>
            </radialGradient>
        </defs>
        <ellipse cx="200" cy="150" rx="150" ry="100" fill="url(#algaeGradient)"/>
        <circle cx="180" cy="130" r="15" fill="#27ae60" opacity="0.6"/>
        <circle cx="220" cy="160" r="12" fill="#27ae60" opacity="0.7"/>
        <circle cx="200" cy="145" r="18" fill="#2ecc71" opacity="0.8"/>
        <path d="M150 150 Q200 120 250 150" stroke="#16a085" stroke-width="2" fill="none" opacity="0.5"/>
    </svg>`;

export const ALGAE_FILLER = `data:image/svg+xml;base64,${btoa(SVG)}`;
