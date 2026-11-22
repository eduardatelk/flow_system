import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Alunos from "./components/Alunos";
import Agenda from "./components/Agenda";
import Usuarios from "./components/Usuarios";
import Login from "./components/Login";
import { obterToken, limparToken } from "./api";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [logado, setLogado] = useState(Boolean(obterToken()));
  const [telaAtiva, setTelaAtiva] = useState("alunos");

  function aoLogar(dadosUsuario) {
    setUsuario(dadosUsuario);
    setTelaAtiva("alunos");
    setLogado(true);
  }

  function aoSair() {
    limparToken();
    setUsuario(null);
    setLogado(false);
  }

  if (!logado) {
    return <Login aoLogar={aoLogar} />;
  }

  return (
    <div className="app">
      <Sidebar telaAtiva={telaAtiva} aoSelecionar={setTelaAtiva} usuario={usuario} aoSair={aoSair} />
      <main className="conteudo">
        {telaAtiva === "alunos" && <Alunos />}
        {telaAtiva === "agenda" && <Agenda />}
        {telaAtiva === "usuarios" && <Usuarios />}
      </main>
    </div>
  );
}
