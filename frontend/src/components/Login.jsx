import { useState } from "react";
import { api } from "../api";

export default function Login({ aoLogar }) {
  const [email, setEmail] = useState("daiana@flow.com");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuario = await api.logar(email, senha);
      aoLogar(usuario);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={aoEnviar}>
        <p className="login__logo">Flow</p>
        <p className="conteudo__subtitulo" style={{ marginBottom: 20 }}>
          Entre para gerenciar seus alunos e aulas
        </p>

        <label className="campo">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </label>
        <label className="campo" style={{ marginTop: 12 }}>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {erro && <p className="erro" style={{ marginTop: 12 }}>{erro}</p>}

        <button className="botao" type="submit" disabled={enviando} style={{ marginTop: 18, width: "100%" }}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
