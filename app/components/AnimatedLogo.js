"use client";

import React from "react";

export default function AnimatedLogo({ size = 44, ...props }) {
  return (
    <div className="animated-logo-container" style={{ width: size, height: size }} {...props}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <g className="floating-group">
          {/* Main Contract document base */}
          <rect
            x="22"
            y="26"
            width="46"
            height="56"
            rx="6"
            fill="url(#logo-grad-teal)"
            stroke="var(--color-primary, #0ca678)"
            strokeWidth="3.5"
          />
          
          {/* Folded paper corner representation */}
          <path
            d="M56 26 L68 38 L56 38 Z"
            fill="rgba(255, 255, 255, 0.15)"
            stroke="var(--color-primary, #0ca678)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Contract horizontal text lines with draw animation */}
          <line
            x1="32"
            y1="46"
            x2="58"
            y2="46"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            className="logo-line line-1"
          />
          <line
            x1="32"
            y1="56"
            x2="52"
            y2="56"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            className="logo-line line-2"
          />
          <line
            x1="32"
            y1="66"
            x2="46"
            y2="66"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            className="logo-line line-3"
          />

          {/* Shield/Checkmark in the bottom corner of contract representing validated security */}
          <circle cx="68" cy="70" r="14" fill="#0da678" stroke="#ffffff" strokeWidth="2.5" className="checkmark-badge" />
          <path
            d="M62 70 L66 74 L74 65"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="checkmark-path"
          />
        </g>

        {/* Project Management Connections / Spinning Gear */}
        <g className="spinning-gear">
          {/* Outer dotted tracking circle */}
          <circle
            cx="76"
            cy="24"
            r="11"
            stroke="var(--color-secondary, #0b7285)"
            strokeWidth="2.5"
            strokeDasharray="4,2.5"
          />
          {/* Inner core node */}
          <circle cx="76" cy="24" r="5" fill="var(--color-secondary, #0b7285)" />
        </g>

        {/* Connecting dashed vector from folder to the project gear */}
        <path
          d="M58 38 L68 28"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeDasharray="3,3"
        />

        <defs>
          <linearGradient id="logo-grad-teal" x1="22" y1="26" x2="68" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0b7285" />
            <stop offset="1" stopColor="#063e49" />
          </linearGradient>
        </defs>
      </svg>

      <style jsx global>{`
        .animated-logo-container {
          display: inline-block;
          flex-shrink: 0;
          position: relative;
        }

        @keyframes float-logo {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }

        @keyframes spin-gear {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes draw-logo-line {
          0% { stroke-dasharray: 0 40; opacity: 0; }
          100% { stroke-dasharray: 40 0; opacity: 1; }
        }

        @keyframes pop-checkmark {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .floating-group {
          animation: float-logo 4s ease-in-out infinite;
        }

        .spinning-gear {
          transform-origin: 76px 24px;
          animation: spin-gear 9s linear infinite;
        }

        .logo-line {
          animation: draw-logo-line 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .line-1 { animation-delay: 0.1s; }
        .line-2 { animation-delay: 0.3s; }
        .line-3 { animation-delay: 0.5s; }

        .checkmark-badge {
          transform-origin: 68px 70px;
          animation: pop-checkmark 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both;
        }

        .checkmark-path {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          animation: draw-logo-line 0.6s ease-out 0.9s forwards;
        }
      `}</style>
    </div>
  );
}
