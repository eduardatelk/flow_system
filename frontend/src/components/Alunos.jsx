import { useEffect, useState } from "react";
import { api } from "../api";
import { formatarTelefone, validarTelefone } from "../formatos";
import Modal from "./Modal";
import { IconeBusca, IconeLapis, IconeLixeira, IconeMais } from "./Icones";

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  async function carregar(busca = "") {
    setCarregando(true);
    try {
      const dados = await api.listarAlunos(busca);
      setAlunos(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(debounce);
  }, [busca]);

  function abrirModal() {
    setErro("");
    setIdEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(aluno) {
    setErro("");
    setIdEditando(aluno.id_cliente);
    setNome(aluno.nome);
    setContato(formatarTelefone(aluno.contato));
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setIdEditando(null);
    setNome("");
    setContato("");
  }

  async function aoCadastrar(evento) {
    evento.preventDefault();
    setErro("");
    if (!nome.trim() || !contato.trim()) {
      setErro("Preencha nome e contato.");
      return;
    }
    if (!validarTelefone(contato)) {
      setErro("Telefone incompleto. Informe DDD + número, ex.: (11) 98765-4321.");
      return;
    }
    try {
      const dados = { nome: nome.trim(), contato: formatarTelefone(contato) };
      if (idEditando) {
        await api.editarAluno(idEditando, dados);
      } else {
        await api.criarAluno(dados);
      }
      fecharModal();
      carregar(busca);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function aoRemover(id) {
    try {
      await api.removerAluno(id);
      carregar(busca);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div className="conteudo__header conteudo__header--linha">
        <div>
          <h1 className="conteudo__titulo">Alunos</h1>
          <p className="conteudo__subtitulo">Gerencie seus alunos e informações de contato</p>
        </div>
        <button className="botao botao--icone" onClick={abrirModal}>
          <IconeMais /> Novo Aluno
        </button>
      </div>

      <div className="card">
        <div className="busca-wrapper">
          <span className="busca-wrapper__icone">
            <IconeBusca />
          </span>
          <input
            className="busca busca--grande"
            placeholder="Buscar alunos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando && <p className="estado-vazio">Carregando...</p>}
        {!carregando && alunos.length === 0 && (
          <p className="estado-vazio">Nenhum aluno cadastrado ainda.</p>
        )}
        {!carregando &&
          alunos.map((aluno) => (
            <div className="linha" key={aluno.id_cliente}>
              <div className="linha__info">
                <div className="linha__principal">{aluno.nome}</div>
                <div className="linha__secundaria">
                  {validarTelefone(aluno.contato) ? formatarTelefone(aluno.contato) : aluno.contato}
                </div>
                <div className="linha__secundaria linha__so-celular">
                  Aulas realizadas: <strong>{aluno.aulas_realizadas}</strong>
                </div>
              </div>
              <div className="linha__acoes">
                <div className="linha__contador">
                  <div className="linha__secundaria">Aulas Realizadas</div>
                  <div className="linha__principal">{aluno.aulas_realizadas}</div>
                </div>
                <button
                  className="botao-icone"
                  title="Editar aluno"
                  onClick={() => abrirEdicao(aluno)}
                >
                  <IconeLapis />
                </button>
                <button
                  className="botao-icone botao-icone--perigo"
                  title="Remover aluno"
                  onClick={() => aoRemover(aluno.id_cliente)}
                >
                  <IconeLixeira />
                </button>
              </div>
            </div>
          ))}
      </div>

      <Modal titulo={idEditando ? "Editar Aluno" : "Novo Aluno"} aberto={modalAberto} aoFechar={fecharModal}>
        <form className="formulario formulario--modal" onSubmit={aoCadastrar}>
          <label className="campo">
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do aluno" autoFocus />
          </label>
          <label className="campo">
            Contato
            <input
              type="tel"
              inputMode="numeric"
              value={contato}
              onChange={(e) => setContato(formatarTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </label>
          {erro && <p className="erro">{erro}</p>}
          <button className="botao" type="submit">
            {idEditando ? "Salvar Alterações" : "Salvar Aluno"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
