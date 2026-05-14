export default function Monogram({ size = 110 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Heirloom By SK monogram"
    >
      <g fill="#FFFDF7">
        {/*
          The mark consists of:
          - Left outer arch: a tall rounded-top pillar, open on the right
          - Left inner vertical bar
          - Right inner vertical bar
          - Right outer arch: a tall rounded-top pillar, open on the left
          - Horizontal crossbar connecting the two inner bars at mid-height

          Reference from image:
          ─ Two outer elements curve inward at top (like parentheses facing inward)
          ─ Two slim inner bars sit inside
          ─ A thin horizontal bridge connects inner bars ~midway
        */}

        {/* Left outer arch — shaped like ] mirrored, curves at top */}
        <path
          d="
            M 28 82
            L 28 30
            Q 28 20 38 20
            L 42 20
            L 42 24
            L 39 24
            Q 32 24 32 30
            L 32 82
            Z
          "
        />

        {/* Left inner bar */}
        <rect x="46" y="20" width="7" height="70" rx="1" />

        {/* Right inner bar */}
        <rect x="57" y="20" width="7" height="70" rx="1" />

        {/* Right outer arch — curves at top, faces left */}
        <path
          d="
            M 82 82
            L 82 30
            Q 82 20 72 20
            L 68 20
            L 68 24
            L 71 24
            Q 78 24 78 30
            L 78 82
            Z
          "
        />

        {/* Horizontal crossbar connecting the two inner bars at ~mid height */}
        <rect x="46" y="52" width="18" height="3.5" />
      </g>
    </svg>
  );
}