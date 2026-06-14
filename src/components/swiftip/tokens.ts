export const T = {
  teal:    "#0A7B6C",
  tealDk:  "#075C51",
  tealLt:  "#E6F4F2",
  amber:   "#F5A623",
  amberLt: "#FEF6E7",
  amberDk: "#C4841C",
  dark:    "#1A2B2A",
  mid:     "#4A6360",
  muted:   "#8FA8A5",
  border:  "#D4E5E3",
  bg:      "#F4F9F8",
  white:   "#FFFFFF",
  red:     "#D94040",
  green:   "#1E8C5A",
} as const;

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${T.bg}; color: ${T.dark}; }

  @keyframes pulse-num {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.06); color: ${T.amber}; }
    100% { transform: scale(1); }
  }
  @keyframes slide-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .pulse    { animation: pulse-num 0.5s ease; }
  .slide-in { animation: slide-in 0.3s ease; }
  .fade-in  { animation: fade-in 0.25s ease; }

  .card {
    background: ${T.white};
    border-radius: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(10,123,108,0.06);
    padding: 24px;
  }
  .btn-primary {
    background: ${T.teal};
    color: ${T.white};
    border: none;
    border-radius: 12px;
    padding: 14px 24px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s, transform 0.1s;
  }
  .btn-primary:hover  { background: ${T.tealDk}; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-amber {
    background: ${T.amber};
    color: ${T.white};
    border: none;
    border-radius: 12px;
    padding: 14px 24px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s, transform 0.1s;
  }
  .btn-amber:hover  { background: ${T.amberDk}; }
  .btn-amber:active { transform: scale(0.98); }
  .btn-amber:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-ghost {
    background: transparent;
    color: ${T.teal};
    border: 1.5px solid ${T.border};
    border-radius: 12px;
    padding: 12px 20px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-ghost:hover { border-color: ${T.teal}; background: ${T.tealLt}; }

  input, select {
    width: 100%;
    border: 1.5px solid ${T.border};
    border-radius: 10px;
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    color: ${T.dark};
    background: ${T.white};
    outline: none;
    transition: border-color 0.2s;
  }
  input:focus, select:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLt}; }
  label { font-size: 13px; font-weight: 500; color: ${T.mid}; margin-bottom: 6px; display: block; }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    padding: 3px 10px; border-radius: 20px;
  }
  .tag-green { background: #E6F5EE; color: ${T.green}; }
  .tag-amber { background: ${T.amberLt}; color: ${T.amberDk}; }
  .tag-teal  { background: ${T.tealLt}; color: ${T.teal}; }
  .tag-red   { background: #FDEAEA; color: ${T.red}; }

  .divider { border: none; border-top: 1px solid ${T.border}; margin: 16px 0; }
  .spinner {
    width: 20px; height: 20px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
`;
