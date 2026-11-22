import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Modal from "./Modal";
import { IconeLapis, IconeLixeira, IconeMais } from "./Icones";

const TIPOS_AULA = ["Yoga", "Treinamento Funcional"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function converterParaISO(dataObj) {
  const ano = dataObj.getFullYear();
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  const dia = String(dataObj.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function converterDeISO(iso) {
  return new Date(iso + "T00:00:00");
}

function somarDias(iso, quantidade) {
  const d = converterDeISO(iso);
  d.setDate(d.getDate() + quantidade);
  return converterParaISO(d);
}

function obterHojeISO() {
  return converterParaISO(new Date());
}

function obterInfoDia(iso) {
  const d = converterDeISO(iso);
  return {
    iso,
    diaSemana: DIAS_SEMANA[d.getDay()],
    diaNumero: d.getDate(),
    mes: MESES[d.getMonth()],
  };
}

function listarDiasDaSemana(inicio) {
  return Array.from({ length: 7 }, (_, i) => obterInfoDia(somarDias(inicio, i)));
}

function aplicarMascaraHorario(valor) {
  const limpo = valor.replace(/[^\d:]/g, "");
  const posDoisPontos = limpo.indexOf(":");
  if (posDoisPontos !== -1) {
    const horas = limpo.slice(0, posDoisPontos).slice(0, 2);
    const minutos = limpo.slice(posDoisPontos + 1).replace(/:/g, "").slice(0, 2);
    return horas + ":" + minutos;
  }
  const digitos = limpo.slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return digitos.slice(0, 2) + ":" + digitos.slice(2);
}

function normalizarHorario(valor) {
  const m = valor.match(/^(\d{1,2})(?::(\d{0,2}))?$/);
  if (!m) return valor;
  const horas = m[1].padStart(2, "0");
  const minutos = (m[2] || "").padEnd(2, "0");
  return horas + ":" + minutos;
}

function validarHorario(valor) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function Agenda() {
  const hoje = obterHojeISO();
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [inicioSemana, setInicioSemana] = useState(hoje);

  const [aulas, setAulas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [data, setData] = useState(diaSelecionado);
  const [horario, setHorario] = useState("");
  const [idCliente, setIdCliente] = useState("");
  const [buscaAluno, setBuscaAluno] = useState("");
  const [listaAberta, setListaAberta] = useState(false);
  const [tipoAula, setTipoAula] = useState(TIPOS_AULA[0]);

  const alunosFiltrados = useMemo(() => {
    const termo = normalizar(buscaAluno.trim());
    if (!termo) return alunos;
    return alunos.filter((a) => normalizar(a.nome).includes(termo));
  }, [alunos, buscaAluno]);

  const aulasPorDia = useMemo(() => {
    const contagem = {};
    for (const a of aulas) contagem[a.data] = (contagem[a.data] || 0) + 1;
    return contagem;
  }, [aulas]);

  const dias = useMemo(() => listarDiasDaSemana(inicioSemana), [inicioSemana]);

  function selecionarDia(iso) {
    setDiaSelecionado(iso);
    if (iso < inicioSemana || iso > somarDias(inicioSemana, 6)) setInicioSemana(iso);
  }

  function irParaHoje() {
    setInicioSemana(hoje);
    selecionarDia(hoje);
  }

  function navegar(direcao) {
    setInicioSemana(somarDias(inicioSemana, 7 * direcao));
  }

  const rotuloPeriodo = `${dias[0].diaNumero} ${dias[0].mes} – ${dias[6].diaNumero} ${dias[6].mes} ${converterDeISO(dias[6].iso).getFullYear()}`;

  function selecionarAluno(aluno) {
    setIdCliente(String(aluno.id_cliente));
    setBuscaAluno(aluno.nome);
    setListaAberta(false);
  }

  async function carregar() {
    setCarregando(true);
    try {
      const [dadosAulas, dadosAlunos] = await Promise.all([
        api.listarAulas(),
        api.listarAlunos(),
      ]);
      setAulas(dadosAulas);
      setAlunos(dadosAlunos);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirModal() {
    setErro("");
    setIdEditando(null);
    setData(diaSelecionado);
    setModalAberto(true);
  }

  function abrirEdicao(aula) {
    setErro("");
    setAviso("");
    setIdEditando(aula.id_aula);
    setData(aula.data);
    setHorario(aula.horario);
    setIdCliente(String(aula.id_cliente));
    setBuscaAluno(aula.aluno_nome || "");
    setTipoAula(aula.tipo_aula);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setIdEditando(null);
    setHorario("");
    setIdCliente("");
    setBuscaAluno("");
    setListaAberta(false);
    setTipoAula(TIPOS_AULA[0]);
  }

  async function aoAgendar(evento) {
    evento.preventDefault();
    setErro("");
    setAviso("");
    if (!data || !horario || !idCliente) {
      setErro("Preencha data, horário e aluno.");
      return;
    }
    const horarioFinal = normalizarHorario(horario);
    if (!validarHorario(horarioFinal)) {
      setErro("Horário inválido. Use o formato HH:MM (ex.: 07:30).");
      return;
    }
    try {
      const dados = {
        data,
        horario: horarioFinal,
        id_cliente: Number(idCliente),
        tipo_aula: tipoAula,
      };
      const resultado = idEditando
        ? await api.editarAula(idEditando, dados)
        : await api.criarAula(dados);
      selecionarDia(data);
      fecharModal();
      if (resultado.aviso) setAviso(resultado.aviso);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function aoRemover(id) {
    try {
      await api.removerAula(id);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  const aulasDoDia = aulas
    .filter((a) => a.data === diaSelecionado)
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const dataSelecionada = new Date(diaSelecionado + "T00:00:00");
  const diaSelecionadoFormatado =
    dataSelecionada.toLocaleDateString("pt-BR", { weekday: "long" }) +
    ", " +
    dataSelecionada.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return (
    <div>
      <div className="conteudo__header conteudo__header--linha">
        <div>
          <h1 className="conteudo__titulo">Agenda</h1>
          <p className="conteudo__subtitulo">Visualize e organize suas aulas</p>
        </div>
        <button className="botao botao--icone" onClick={abrirModal}>
          <IconeMais /> Nova Aula
        </button>
      </div>

      <div className="agenda-barra">
        <div className="agenda-barra__navegacao">
          <button className="botao-icone" title="Anterior" onClick={() => navegar(-1)}>
            ‹
          </button>
          <span className="agenda-barra__periodo">{rotuloPeriodo}</span>
          <button className="botao-icone" title="Próximo" onClick={() => navegar(1)}>
            ›
          </button>
          <button className="botao-texto" onClick={irParaHoje}>
            Hoje
          </button>
        </div>
      </div>

      <div className="agenda-dias">
        {dias.map((dia) => (
          <button
            key={dia.iso}
            className={
              "dia-box" +
              (dia.iso === diaSelecionado ? " dia-box--ativo" : "") +
              (dia.iso === hoje ? " dia-box--hoje" : "")
            }
            onClick={() => selecionarDia(dia.iso)}
          >
            <span className="dia-box__semana">{dia.diaSemana}</span>
            <span className="dia-box__numero">{dia.diaNumero}</span>
            <span className="dia-box__mes">{dia.mes}</span>
            <span className="dia-box__aulas">
              {aulasPorDia[dia.iso] ? `${aulasPorDia[dia.iso]} aula${aulasPorDia[dia.iso] > 1 ? "s" : ""}` : ""}
            </span>
          </button>
        ))}
      </div>

      {erro && !modalAberto && <p className="erro">{erro}</p>}
      {aviso && <p className="aviso">⚠ {aviso}</p>}

      <div className="card">
        <p className="conteudo__subtitulo" style={{ marginBottom: 12, textTransform: "capitalize" }}>
          Aulas Agendadas: {diaSelecionadoFormatado}
        </p>

        {carregando && <p className="estado-vazio">Carregando...</p>}
        {!carregando && aulasDoDia.length === 0 && (
          <p className="estado-vazio">Nenhuma aula agendada para este dia.</p>
        )}
        {!carregando &&
          aulasDoDia.map((aula) => (
            <div className="linha" key={aula.id_aula}>
              <div>
                <div className="linha__principal">{aula.aluno_nome}</div>
                <div className="linha__secundaria">{aula.tipo_aula}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="linha__principal" style={{ marginRight: 8 }}>{aula.horario}</div>
                <button
                  className="botao-icone"
                  title="Editar aula"
                  onClick={() => abrirEdicao(aula)}
                >
                  <IconeLapis />
                </button>
                <button
                  className="botao-icone botao-icone--perigo"
                  title="Remover agendamento"
                  onClick={() => aoRemover(aula.id_aula)}
                >
                  <IconeLixeira />
                </button>
              </div>
            </div>
          ))}
      </div>

      <Modal titulo={idEditando ? "Editar Aula" : "Nova Aula"} aberto={modalAberto} aoFechar={fecharModal}>
        <form className="formulario formulario--modal" onSubmit={aoAgendar}>
          <label className="campo">
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </label>
          <label className="campo">
            Horário
            <input
              type="text"
              inputMode="numeric"
              placeholder="HH:MM"
              maxLength={5}
              value={horario}
              onChange={(e) => setHorario(aplicarMascaraHorario(e.target.value))}
              onBlur={() => horario && setHorario(normalizarHorario(horario))}
              autoFocus
            />
          </label>
          <div className="campo">
            <label htmlFor="busca-aluno">Aluno</label>
            <div className="autocomplete">
              <input
                id="busca-aluno"
                type="text"
                placeholder="Digite o nome do aluno..."
                autoComplete="off"
                value={buscaAluno}
                onChange={(e) => {
                  setBuscaAluno(e.target.value);
                  setIdCliente("");
                  setListaAberta(true);
                }}
                onFocus={() => setListaAberta(true)}
                onBlur={() => setTimeout(() => setListaAberta(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && listaAberta && alunosFiltrados.length > 0 && !idCliente) {
                    e.preventDefault();
                    selecionarAluno(alunosFiltrados[0]);
                  } else if (e.key === "Escape") {
                    setListaAberta(false);
                  }
                }}
              />
              {listaAberta && alunos.length > 0 && (
                <ul className="autocomplete__lista">
                  {alunosFiltrados.length === 0 && (
                    <li className="autocomplete__vazio">Nenhum aluno encontrado</li>
                  )}
                  {alunosFiltrados.map((a) => (
                    <li
                      key={a.id_cliente}
                      className={
                        "autocomplete__item" +
                        (String(a.id_cliente) === idCliente ? " autocomplete__item--ativo" : "")
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selecionarAluno(a);
                      }}
                    >
                      {a.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <label className="campo">
            Tipo de aula
            <select value={tipoAula} onChange={(e) => setTipoAula(e.target.value)}>
              {TIPOS_AULA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {alunos.length === 0 && (
            <p className="estado-vazio">
              Cadastre um aluno na tela "Alunos" antes de agendar uma aula.
            </p>
          )}
          {erro && <p className="erro">{erro}</p>}
          <button className="botao" type="submit">
            {idEditando ? "Salvar Alterações" : "Salvar Agendamento"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
