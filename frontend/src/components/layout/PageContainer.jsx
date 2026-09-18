import React from 'react';

const PageContainer = ({ children, title, subtitle, badge = null, action = null }) => {
  return (
    <div className="min-h-[calc(100vh-7rem)] bg-gradient-to-b from-[#110e20] via-[#0d101a] to-[#0a0d14]">
      {/* Editorial Header Banner Area */}
      {title && (
        <div className="border-b border-purple-900/30 bg-gradient-to-r from-[#1c1433]/80 via-[#141226]/60 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  {badge && (
                    <span className="bg-brand-600/90 text-white font-bold px-2.5 py-0.5 rounded text-xs tracking-wider uppercase">
                      {badge}
                    </span>
                  )}
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-300/80 font-mono">
                    SENTINEL INTELLIGENCE
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
