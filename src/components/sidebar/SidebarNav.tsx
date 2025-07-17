{/* Ícone no canto superior direito quando expandido */}
              {!isCollapsed && (
                <button 
                  className="absolute top-3 right-3 w-8 h-8 rounded-md bg-gray-100 dark:bg-[#29335C]/40 hover:bg-gray-200 dark:hover:bg-[#29335C]/60 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer z-10 border border-transparent hover:border-gray-300 dark:hover:border-[#CC5500]/30"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCardFlipped(!isCardFlipped);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ 
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  title="Trocar lado do cartão"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#CC5500] pointer-events-none"
                    style={{ pointerEvents: 'none' }}
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M3 21v-5h5"/>
                  </svg>
                </button>
              )}