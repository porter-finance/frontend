import React from 'react'

import { Logo } from './common/Logo'

export const MobileBlocker = () => (
  <main className="block sm:hidden">
    <a
      aria-current="page"
      aria-label="Porter Homepage"
      className="absolute portrait:inset-x-0 top-5 landscape:top-5 portrait:top-10 left-6 landscape:left-6 z-10 portrait:mx-auto text-center md:top-12 md:left-14"
      data-v-40b60d66=""
      href="/"
      role="navigation"
    >
      <div className="flex justify-center items-center space-x-4 md:w-auto">
        <Logo />
        <span className="text-xl font-medium text-white">Porter Finance</span>
      </div>
    </a>
    <img
      alt=""
      aria-hidden="true"
      className="z-0 pointer-events-none glow"
      role="presentation"
      src="/assets/bg_glow.svg"
      style={{
        position: 'absolute',
        left: '50%',
        width: '200%',
        maxWidth: 'none',
        height: 'auto',
        top: '0',
        transform: 'translate(-50%,-20%)',
      }}
    />
    <section className="flex absolute top-1/2 left-1/2 z-10 justify-center items-center mx-auto text-center -translate-x-1/2 -translate-y-1/2">
      <div className="relative z-10 mx-auto h-full text-center">
        <div>
          <svg
            className="mx-auto"
            height={127}
            viewBox="0 0 122 127"
            width={122}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" fillRule="evenodd">
              <path
                d="M58 33H6a4 4 0 00-4 4v84a4 4 0 004 4h52a4 4 0 004-4V37a4 4 0 00-4-4zm29.756 40H108a4 4 0 014 4v5.976M104 117H87.874zm.814-80.1A47.848 47.848 0 0082.499 7.937 47.85 47.85 0 0046.03 3.155m48.535 27.883l10.393 6 6-10.393"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
              />
              <path
                d="M10 65.244V45a4 4 0 014-4h5.976M54 49v16.126zm0 44.132V113a4 4 0 01-4 4h-3.994m-27.986 0H14a4 4 0 01-4-4V93.214M66.603 125h49.714c2.034 0 3.683-1.79 3.683-4V69c0-2.21-1.649-4-3.683-4H62m50 26v8m-86 18h12M28 41h8"
                opacity=".504"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
              />
              <path
                d="M112 115a2 2 0 110 4 2 2 0 010-4zm0-8a2 2 0 110 4 2 2 0 010-4zM46 39a2 2 0 110 4 2 2 0 010-4zm8 0a2 2 0 110 4 2 2 0 010-4z"
                fill="#fff"
                fillRule="nonzero"
              />
            </g>
          </svg>
        </div>
        <div className="mx-auto mt-8">
          <h1 className="text-2xl font-medium">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 text-gradient">
              Please rotate your device
            </span>
          </h1>
        </div>
        <div className="mx-auto mt-6">
          <p className="text-base text-white">Visit in desktop for the best experience.</p>
        </div>
      </div>
    </section>
  </main>
)
