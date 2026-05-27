"use client";

/**
 * global-error.tsx — substitui o root layout inteiro.
 * Precisa incluir <html> e <body> e não pode usar providers do app.
 * Usa estilos inline sem depender de MUI ou Tailwind.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Erro crítico — Financeiro</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a0505 100%);
            color: #e2e8f0;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ticker {
            from { transform: translateX(100%); }
            to   { transform: translateX(-100%); }
          }

          .ticker-wrap {
            position: fixed; top: 0; left: 0; right: 0;
            background: #7f1d1d; overflow: hidden; padding: 8px 0;
          }
          .ticker {
            display: inline-block;
            animation: ticker 20s linear infinite;
            font-size: 0.7rem; font-weight: 700; color: #fca5a5;
            letter-spacing: 0.1em; white-space: nowrap;
          }

          .icon {
            font-size: 5rem;
            animation: spin-slow 8s linear infinite;
            margin-bottom: 8px;
            user-select: none;
          }

          .status {
            font-size: clamp(4rem, 12vw, 8rem);
            font-weight: 900;
            letter-spacing: -0.05em;
            color: #ef4444;
            text-shadow: 0 0 60px rgba(239,68,68,0.5), 0 0 120px rgba(239,68,68,0.2);
            animation: blink 2.5s ease-in-out infinite;
            line-height: 1;
            margin-bottom: 8px;
          }

          .card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(239,68,68,0.25);
            border-radius: 16px;
            max-width: 480px;
            width: 100%;
            overflow: hidden;
            animation: slide-in 0.5s ease both;
            animation-delay: 0.1s;
            opacity: 0;
            margin-top: 20px;
          }

          .card-header {
            background: linear-gradient(135deg, #7f1d1d, #991b1b);
            padding: 16px 24px;
            border-bottom: 1px solid rgba(239,68,68,0.2);
          }
          .card-header .label {
            font-size: 0.6rem; font-weight: 700; letter-spacing: 0.14em;
            color: rgba(255,255,255,0.55); text-transform: uppercase;
          }
          .card-header .title {
            font-size: 1.05rem; font-weight: 800; color: white; margin-top: 2px;
          }

          .card-body { padding: 20px 24px; }

          .alert-box {
            background: rgba(245,158,11,0.1);
            border: 1px solid rgba(245,158,11,0.25);
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 16px;
          }
          .alert-label {
            font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em;
            color: #f59e0b; text-transform: uppercase; margin-bottom: 4px;
          }
          .alert-text { font-size: 0.82rem; color: #94a3b8; font-style: italic; line-height: 1.5; }

          .error-box {
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 20px;
          }
          .error-label {
            font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em;
            color: #64748b; text-transform: uppercase; margin-bottom: 4px;
          }
          .error-text {
            font-family: monospace; font-size: 0.72rem;
            color: #ef4444; word-break: break-all; line-height: 1.5;
          }
          .error-digest {
            font-family: monospace; font-size: 0.65rem; color: #475569;
            margin-top: 4px;
          }

          .divider {
            height: 1px; margin: 0 -24px;
            background: repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 8px, transparent 8px 16px);
            margin-bottom: 20px;
          }

          .btn-group { display: flex; gap: 12px; flex-wrap: wrap; }
          .btn {
            flex: 1; min-width: 120px; padding: 10px 16px;
            border-radius: 10px; font-size: 0.85rem; font-weight: 700;
            cursor: pointer; border: none; transition: all 0.2s;
            font-family: inherit; letter-spacing: 0.01em;
          }
          .btn-primary {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 4px 14px rgba(239,68,68,0.35);
          }
          .btn-primary:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); }
          .btn-secondary {
            background: transparent;
            color: #94a3b8;
            border: 1px solid rgba(255,255,255,0.12);
          }
          .btn-secondary:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }

          .footer { margin-top: 20px; font-size: 0.68rem; color: rgba(148,163,184,0.4); text-align: center; }
        `}</style>
      </head>
      <body>
        {/* Ticker tape */}
        <div className="ticker-wrap">
          <span className="ticker">
            ☢️ FALÊNCIA SISTÊMICA DETECTADA &nbsp;•&nbsp; TODAS AS RESERVAS ESGOTADAS
            &nbsp;•&nbsp; CONTATE O SUPORTE (BOA SORTE) &nbsp;•&nbsp; SALDO DO SERVIDOR: R$&nbsp;0,00
            &nbsp;•&nbsp; ☢️ FALÊNCIA SISTÊMICA DETECTADA &nbsp;•&nbsp; TODAS AS RESERVAS ESGOTADAS
            &nbsp;•&nbsp; CONTATE O SUPORTE (BOA SORTE) &nbsp;•&nbsp; SALDO DO SERVIDOR: R$&nbsp;0,00
          </span>
        </div>

        {/* Icon */}
        <div className="icon">☢️</div>

        {/* Status */}
        <div className="status">FALÊNCIA</div>

        {/* Card */}
        <div className="card">
          <div className="card-header">
            <div className="label">Boletim de Calamidade Financeira</div>
            <div className="title">Financeiro — Colapso Total do Sistema</div>
          </div>
          <div className="card-body">
            <div className="alert-box">
              <div className="alert-label">📋 Laudo oficial</div>
              <div className="alert-text">
                "O sistema entrou em processo de recuperação judicial inesperado.
                Os ativos de estabilidade foram liquidados sem aviso prévio.
                Recomenda-se aguardar ou recarregar a página com fé."
              </div>
            </div>

            {error?.message && (
              <div className="error-box">
                <div className="error-label">🐛 Detalhes do colapso</div>
                <div className="error-text">{error.message}</div>
                {error.digest && (
                  <div className="error-digest">digest: {error.digest}</div>
                )}
              </div>
            )}

            <div className="divider" />

            <div className="btn-group">
              <button className="btn btn-primary" onClick={reset}>
                ↺ Tentar reabrir caixa
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { window.location.href = "/"; }}
              >
                🏠 Ir ao início
              </button>
            </div>
          </div>
        </div>

        <div className="footer">
          Erro global — O app entrou em colapso financeiro total
        </div>
      </body>
    </html>
  );
}
