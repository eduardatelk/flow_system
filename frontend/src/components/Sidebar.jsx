export default function Sidebar({ telaAtiva, aoSelecionar, usuario, aoSair }) {
  const itens = [
    { chave: "alunos", rotulo: "Alunos" },
    { chave: "agenda", rotulo: "Agenda" },
    { chave: "usuarios", rotulo: "Usuários" },
  ];

  return (
    <aside className="sidebar">
      <p className="sidebar__logo">Flow</p>
      <nav className="sidebar__nav">
        {itens.map((item) => (
          <button
            key={item.chave}
            className={
              "sidebar__item" +
              (telaAtiva === item.chave ? " sidebar__item--active" : "")
            }
            onClick={() => aoSelecionar(item.chave)}
          >
            {item.rotulo}
          </button>
        ))}
      </nav>

      <div className="sidebar__rodape">
        {usuario && <p className="sidebar__usuario">{usuario.nome}</p>}
        <button className="sidebar__sair" onClick={aoSair}>
          Sair
        </button>
      </div>
    </aside>
  );
}
