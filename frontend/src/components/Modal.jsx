import { IconeFechar } from "./Icones";

export default function Modal({ titulo, aberto, aoFechar, children }) {
  if (!aberto) return null;

  return (
    <div className="modal__fundo" onClick={aoFechar}>
      <div className="modal__caixa" onClick={(e) => e.stopPropagation()}>
        <div className="modal__cabecalho">
          <h2 className="modal__titulo">{titulo}</h2>
          <button className="modal__fechar" onClick={aoFechar} aria-label="Fechar">
            <IconeFechar />
          </button>
        </div>
        <div className="modal__corpo">{children}</div>
      </div>
    </div>
  );
}
