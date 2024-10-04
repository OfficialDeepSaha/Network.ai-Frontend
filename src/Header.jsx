import React from 'react'
import './Header.css'

export const Header = () => {
  return (
    <><header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7eef4] px-10 py-4">
      <div className="flex items-center gap-8 " style={{ marginLeft: '290px' }}>
        <div className="flex items-center gap-4 text-[#0d151c]">
          <div className="size-4">
            <svg
              className="bouncing-svg"
              viewBox="0 0 48 48"
              width={26}
              height={26}
              style={{marginTop:"-4px"}}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientColors"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" style={{ stopColor: "#00b5ff" }} />
                  <stop offset="100%" style={{ stopColor: "#ab4bf2" }} />
                </linearGradient>
              </defs>
              <path
                d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                fill="url(#gradientColors)" />
            </svg>
          </div>
          <div className="flex items-center text-indigo-800">
            <span className="animate-colorPulse h-6 w-auto text-indigo-600 sm:h-8" />
            <h2 className="animate-colorPulse text-2xl bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold">Network.ai</h2>
          </div>
        </div>
      </div>
      <div className="flex flex-1 justify-end gap-8" style={{ marginRight: '290px' }}>
        <div className="flex gap-2">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-white shadow-lg text-[#0d151c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-indigo-50">
            <div className="text-[#0d151c]" data-icon="Bell" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
              </svg>
            </div>
          </button>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-white shadow-lg text-[#0d151c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-indigo-50">
            <div className="text-[#0d151c]" data-icon="ChatCircleDots" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z" />
              </svg>
            </div>
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shadow-lg"
          style={{
            backgroundImage: 'url("https://cdn.usegalileo.ai/stability/59eb5ab2-d1c5-449b-b98d-7e7ac536ea3d.png")'
          }} />
      </div>
    </header></>
  )
}
