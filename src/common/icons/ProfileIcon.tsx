import React from "react";

export interface ProfileIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  width = "100%",
  height = "100%",
  className = "",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    width={width}
    height={height}
    className={className}
    {...props}
  >
    <defs>
      {/* Avatar clipping boundary */}
      <clipPath id="avatar-clip">
        <circle cx="200" cy="200" r="162" />
      </clipPath>

      {/* Subtle soft shadow beneath circle */}
      <filter id="circle-shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#551a1a" floodOpacity="0.18" />
      </filter>
    </defs>

    {/* Circular Badge Background */}
    <circle cx="200" cy="200" r="162" fill="#E86663" filter="url(#circle-shadow)" />

    <g clipPath="url(#avatar-clip)">
      {/* Hair Base / Back Volume */}
      <path
        d="M 152 178 C 134 165, 133 130, 142 108 C 152 86, 175 75, 206 72 C 245 68, 266 90, 268 116 C 270 144, 258 178, 254 186 C 246 142, 218 128, 194 135 C 174 141, 160 162, 152 178 Z"
        fill="#8A2528"
      />

      {/* Left Ear */}
      <path
        d="M 153 172 C 138 172, 134 188, 137 202 C 140 216, 152 216, 156 206 Z"
        fill="#F5C4B5"
      />

      {/* Right Ear */}
      <path
        d="M 245 174 C 260 174, 266 188, 263 203 C 260 216, 248 215, 245 205 Z"
        fill="#F5C4B5"
      />

      {/* Neck with Soft Shadow */}
      <path d="M 176 220 L 176 266 C 184 278, 216 278, 224 266 L 224 220 Z" fill="#E8AA99" />
      {/* Neck Main Light */}
      <path d="M 179 238 L 179 265 C 188 274, 212 274, 221 265 L 221 238 Z" fill="#F7CABF" />

      {/* Face Silhouette */}
      <path
        d="M 151 168 C 148 135, 252 135, 249 168 C 247 195, 246 220, 228 243 C 214 260, 186 260, 172 243 C 154 220, 153 195, 151 168 Z"
        fill="#F9D1C5"
      />

      {/* Front Quiff / Hair Bangs Flowing Across Forehead */}
      <path
        d="M 152 165 C 140 142, 142 110, 165 92 C 185 76, 220 74, 242 88 C 258 98, 267 116, 266 138 C 258 130, 250 125, 238 126 C 212 128, 192 138, 178 143 C 166 148, 158 158, 152 165 Z"
        fill="#94262A"
      />

      {/* Torso / Shirt */}
      <path
        d="M 88 360 C 92 292, 142 264, 168 261 C 178 286, 222 286, 232 261 C 258 264, 308 292, 312 360 C 280 376, 120 376, 88 360 Z"
        fill="#8A2528"
      />

      {/* Subtle Collar Trim Accent */}
      <path
        d="M 170 262 C 182 283, 218 283, 230 262 C 224 274, 176 274, 170 262 Z"
        fill="#731C20"
      />
    </g>
  </svg>
);

export default ProfileIcon;
