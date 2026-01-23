-- Execute as a superuser
CREATE ROLE asa WITH LOGIN PASSWORD 'asa';
CREATE DATABASE asa OWNER asa;
\c asa;

CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(120) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO usuarios (username, email, password_hash, role, active)
VALUES ('admin@asa.local', 'admin@asa.local', '$2b$12$WJ8qJK5Pg5jPskxCG4M8SO8RrzoufvUujYmvsLlZ40AKJAYoe1En6', 'ADMIN', TRUE);

CREATE TABLE unidade (
  id BIGSERIAL PRIMARY KEY,
  nomeUnidade VARCHAR(255) NOT NULL,
  diretor VARCHAR(255),
  telefone VARCHAR(50),
  bairro VARCHAR(255),
  cidade VARCHAR(255),
  regiao VARCHAR(255),
  distrito VARCHAR(255),
  emailUnidade VARCHAR(255),
  enderecoCompleto VARCHAR(500),
  anoEleicao INTEGER
);

CREATE TABLE relatorio (
  id BIGSERIAL PRIMARY KEY,
  unidade_id BIGINT NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  beneficiarios INTEGER NOT NULL,
  itens INTEGER,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor DOUBLE PRECISION
);

CREATE TABLE campanha (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco_base VARCHAR(255),
  data_inicio DATE,
  data_fim DATE
);

CREATE TABLE campanha_local (
  id BIGSERIAL PRIMARY KEY,
  campanha_id BIGINT NOT NULL REFERENCES campanha(id) ON DELETE CASCADE,
  local VARCHAR(255) NOT NULL
);

CREATE TABLE agendamento (
  id BIGSERIAL PRIMARY KEY,
  campanha_id BIGINT NOT NULL REFERENCES campanha(id) ON DELETE CASCADE,
  unidade_id BIGINT NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  local VARCHAR(255) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL
);

CREATE TABLE arquivo (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  data DATE NOT NULL
);

CREATE TABLE vida_unidade (
  id BIGSERIAL PRIMARY KEY,
  unidade_id BIGINT NOT NULL UNIQUE REFERENCES unidade(id) ON DELETE CASCADE,
  metas_json TEXT,
  pendencias_json TEXT
);

CREATE TABLE gestao_unidade (
  id BIGSERIAL PRIMARY KEY,
  unidade_id BIGINT NOT NULL UNIQUE REFERENCES unidade(id) ON DELETE CASCADE,
  patrimonio_json TEXT,
  projetos_json TEXT
);

CREATE TABLE atividades_asa (
  id BIGSERIAL PRIMARY KEY,
  asa_identificacao VARCHAR(255) NOT NULL,
  periodo_relatorio VARCHAR(50) NOT NULL,
  diretor_nome VARCHAR(255) NOT NULL,
  telefone_contato VARCHAR(50) NOT NULL,
  possui_instagram BOOLEAN NOT NULL,
  possui_email_proprio BOOLEAN NOT NULL,
  possui_uniforme_oficial BOOLEAN NOT NULL,
  possui_novo_manual_asa BOOLEAN NOT NULL,
  possui_livro_beneficencia_social BOOLEAN NOT NULL,
  email_oficial VARCHAR(255),
  acao_visita_beneficiarios BOOLEAN NOT NULL,
  acao_recolta_donativos BOOLEAN NOT NULL,
  acao_doacao_sangue BOOLEAN NOT NULL,
  acao_campanha_agasalho BOOLEAN NOT NULL,
  acao_feira_solidaria BOOLEAN NOT NULL,
  acao_palestras_educativas BOOLEAN NOT NULL,
  acao_cursos_geracao_renda BOOLEAN NOT NULL,
  acao_mutirao_natal BOOLEAN NOT NULL,
  familias_atendidas INTEGER NOT NULL,
  cestas_basicas_19kg INTEGER NOT NULL,
  pecas_roupas_calcados INTEGER NOT NULL,
  voluntarios_ativos INTEGER NOT NULL,
  estudos_biblicos INTEGER NOT NULL,
  batismos_mes INTEGER NOT NULL,
  reuniao_avaliacao_planejamento BOOLEAN NOT NULL,
  assistencia_alimentos BOOLEAN NOT NULL,
  assistencia_roupas BOOLEAN NOT NULL,
  assistencia_moveis BOOLEAN NOT NULL,
  assistencia_limpeza_higiene BOOLEAN NOT NULL,
  assistencia_construcao BOOLEAN NOT NULL,
  assistencia_material_escolar BOOLEAN NOT NULL,
  assistencia_medicamentos BOOLEAN NOT NULL,
  assistencia_atendimento_saude BOOLEAN NOT NULL,
  assistencia_mutiroes BOOLEAN NOT NULL,
  assistencia_outras TEXT,
  desenvolvimento_capacitacao_profissional BOOLEAN NOT NULL,
  desenvolvimento_curriculo_orientacao BOOLEAN NOT NULL,
  desenvolvimento_curso_idioma BOOLEAN NOT NULL,
  desenvolvimento_curso_informatica BOOLEAN NOT NULL,
  desenvolvimento_cursos_geracao_renda BOOLEAN NOT NULL,
  desenvolvimento_administracao_financeira_lar BOOLEAN NOT NULL,
  desenvolvimento_deixar_fumar_beber BOOLEAN NOT NULL,
  desenvolvimento_prevencao_drogas BOOLEAN NOT NULL,
  desenvolvimento_habitos_saudaveis BOOLEAN NOT NULL,
  desenvolvimento_educacao_sexual BOOLEAN NOT NULL,
  desenvolvimento_educacao_filhos BOOLEAN NOT NULL,
  desenvolvimento_aproveitamento_alimentos BOOLEAN NOT NULL,
  desenvolvimento_alfabetizacao_adultos BOOLEAN NOT NULL,
  desenvolvimento_outras TEXT,
  avaliacao_relatorio INTEGER NOT NULL
);

CREATE TABLE configuracoes_gerais (
  id BIGSERIAL PRIMARY KEY,
  versao VARCHAR(20) NOT NULL,
  data_hora VARCHAR(50) NOT NULL,
  mudancas TEXT NOT NULL
);

CREATE TABLE email_logs (
  id BIGSERIAL PRIMARY KEY,
  assunto VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  cidade VARCHAR(255),
  regiao VARCHAR(255),
  distrito VARCHAR(255),
  quantidade_envios INTEGER NOT NULL,
  data_hora TIMESTAMP NOT NULL
);

-- Garantir permissoes para o usuario da aplicacao
GRANT USAGE ON SCHEMA public TO asa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO asa;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO asa;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO asa;
