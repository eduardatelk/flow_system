import { useEffect, useState } from "react";
import { api } from "../api";
import Modal from "./Modal";
import { IconeLixeira, IconeMais } from "./Icones";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [erroLista, setErroLista] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      setUsuarios(await api.listarUsuarios());
    } catch (e) {
      setErroLista(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirModal() {
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmacao("");
  }

  async function aoCadastrar(evento) {
    evento.preventDefault();
    setErro("");
    if (!nome.trim() || !email.trim() || !senha) {
      setErro("Preencha nome, e-mail e senha.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não conferem.");
      return;
    }
    try {
      await api.criarUsuario({ nome: nome.trim(), email: email.trim(), senha });
      fecharModal();
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function aoRemover(usuario) {
    if (!window.confirm(`Remover o acesso de ${usuario.nome}?`)) return;
    setErroLista("");
    try {
      await api.removerUsuario(usuario.id_usuario);
      carregar();
    } catch (e) {
      setErroLista(e.message);
    }
  }

  return (
    <div>
      <div className="conteudo__header conteudo__header--linha">
        <div>
          <h1 className="conteudo__titulo">Usuários</h1>
          <p className="conteudo__subtitulo">Gerencie quem tem acesso ao sistema</p>
        </div>
        <button className="botao botao--icone" onClick={abrirModal}>
          <IconeMais /> Novo Usuário
        </button>
      </div>

      {erroLista && <p className="erro">{erroLista}</p>}

      <div className="card">
        {carregando && <p className="estado-vazio">Carregando...</p>}
        {!carregando &&
          usuarios.map((usuario) => (
            <div className="linha" key={usuario.id_usuario}>
              <div>
                <div className="linha__principal">{usuario.nome}</div>
                <div className="linha__secundaria">{usuario.email}</div>
              </div>
              <button
                className="botao-icone botao-icone--perigo"
                title="Remover usuário"
                onClick={() => aoRemover(usuario)}
              >
                <IconeLixeira />
              </button>
            </div>
          ))}
      </div>

      <Modal titulo="Novo Usuário" aberto={modalAberto} aoFechar={fecharModal}>
        <form className="formulario formulario--modal" onSubmit={aoCadastrar}>
          <label className="campo">
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" autoFocus />
          </label>
          <label className="campo">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              autoComplete="off"
            />
          </label>
          <label className="campo">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </label>
          <label className="campo">
            Confirmar senha
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </label>
          {erro && <p className="erro">{erro}</p>}
          <button className="botao" type="submit">
            Salvar Usuário
          </button>
        </form>
      </Modal>
    </div>
  );
}
