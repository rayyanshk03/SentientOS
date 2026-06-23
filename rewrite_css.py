import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

new_css = """        /* Global Reset for this view */
        body { 
          background-color: #FFFFFF; 
          margin: 0; 
        }
        
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .cursor-blink { animation: cursor-blink 1s step-end infinite; }
        
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .feat-card {
          background: #F5F5F7;
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 24px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }
        .feat-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 16px 40px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.08);
        }

        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .footer-left { justify-self: start; }
        .footer-center { justify-self: center; }
        .footer-right { justify-self: end; text-align: right; }

        .terminal-card {
          width: 100%;
          max-width: 560px;
          height: 240px;
          box-sizing: border-box;
          margin: 40px auto;
          background: #1D1D1F;
          border-radius: 12px;
          padding: 20px 24px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.8;
          opacity: 0;
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }

        .primary-btn-wrapper {
          position: relative;
          display: inline-block;
          opacity: 0;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.7s;
        }
        .hero-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 980px;
          font-family: 'Inter', -apple-system, sans-serif;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-btn-primary {
          background: #0071E3;
          color: #FFFFFF;
          font-size: 17px;
          font-weight: 500;
          border: none;
        }
        .hero-btn-primary:hover {
          background: #0077ED;
          transform: scale(1.02);
        }
        .hero-btn-primary:active {
          transform: scale(0.98);
        }

        .hero-btn-secondary {
          background: rgba(0,0,0,0.05);
          border: none;
          color: #1D1D1F;
          font-size: 17px;
          font-weight: 500;
        }
        .hero-btn-secondary:hover {
          background: rgba(0,0,0,0.08);
          transform: scale(1.02);
        }
        .hero-btn-secondary:active {
          transform: scale(0.98);
        }

        .nav-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        @media (max-width: 900px) {
          .feat-grid {
            grid-template-columns: 1fr;
          }
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
          }
          .footer-left, .footer-center, .footer-right {
            justify-self: center;
            text-align: center;
          }
        }
"""

# Extract the existing style block using regex
pattern = re.compile(r"<style>\{`.*?`\}</style>", re.DOTALL)
content = pattern.sub(f"<style>{{`\n{new_css}`}}</style>", content)

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
