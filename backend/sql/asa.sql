-- Execute as a superuser
CREATE ROLE asa WITH LOGIN PASSWORD 'asa';
CREATE DATABASE asa OWNER asa;
\c asa;

CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO usuarios (username, password_hash, role, active)
VALUES ('admin', '$2b$12$WJ8qJK5Pg5jPskxCG4M8SO8RrzoufvUujYmvsLlZ40AKJAYoe1En6', 'ADMIN', TRUE);

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

-- Garantir permissoes para o usuario da aplicacao
GRANT USAGE ON SCHEMA public TO asa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO asa;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO asa;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO asa;
