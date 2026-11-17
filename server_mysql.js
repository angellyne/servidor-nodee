const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexão com o MySQL (XAMPP)
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'educontrol'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL: ', err.stack);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');

  // --- CRIAÇÃO DAS TABELAS ---
  const queries = [
    `CREATE TABLE IF NOT EXISTS alunos(
      id_aluno INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      cpf VARCHAR(14),
      data_nascimento DATE
    )`,
    `CREATE TABLE IF NOT EXISTS turmas(
      id_turma INT AUTO_INCREMENT PRIMARY KEY,
      serie VARCHAR(255) NOT NULL,
      ano_letivo INT NOT NULL,
      chamada INT,
      capacidade INT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS escolas(
      id_escola INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      endereco VARCHAR(255) NOT NULL,
      cnpj VARCHAR(18) NOT NULL,
      telefone VARCHAR(20)
    )`,
    `CREATE TABLE IF NOT EXISTS disciplinas(
      id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      carga_horaria INT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS professores(
      id_professor INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      cpf VARCHAR(14) NOT NULL,
      email VARCHAR(255) NOT NULL,
      id_escola INT,
      FOREIGN KEY (id_escola) REFERENCES escolas(id_escola)
    )`,
    // Tabelas do diagrama que o Dashboard procura (mesmo vazias)
    `CREATE TABLE IF NOT EXISTS matriculas(
      id_matricula INT AUTO_INCREMENT PRIMARY KEY,
      numero_matricula VARCHAR(50) NOT NULL,
      periodo_letivo VARCHAR(10)
    )`,
    `CREATE TABLE IF NOT EXISTS historico_presenca(
      id_historico INT AUTO_INCREMENT PRIMARY KEY,
      data_presenca DATE,
      status_presenca VARCHAR(20)
    )`
  ];

  queries.forEach(q => connection.query(q, (err) => { if (err) console.error('Erro ao criar tabela:', err); }));
});

// ==========================================
// ROTAS DA API (GET, POST, DELETE)
// ==========================================

// --- ESCOLAS ---
app.get('/escolas', (req, res) => {
  connection.query('SELECT * FROM escolas', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar escolas' });
    res.json(results);
  });
});
app.post('/escolas', (req, res) => {
  const { nome, endereco, cnpj, telefone } = req.body;
  connection.query('INSERT INTO escolas (nome, endereco, cnpj, telefone) VALUES (?, ?, ?, ?)',
    [nome, endereco, cnpj, telefone], (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar escola' });
      res.json(results);
    });
});
app.delete('/escolas/:id', (req, res) => {
  connection.query('DELETE FROM escolas WHERE id_escola = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir escola' });
    res.json(results);
  });
});

// --- PROFESSORES ---
app.get('/professores', (req, res) => {
  // Faz um JOIN para trazer o nome da escola no frontend
  const sql = `SELECT p.*, e.nome AS escola FROM professores p LEFT JOIN escolas e ON p.id_escola = e.id_escola`;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar professores' });
    res.json(results);
  });
});
app.post('/professores', (req, res) => {
  const { nome, cpf, email, id_escola } = req.body;
  connection.query('INSERT INTO professores (nome, cpf, email, id_escola) VALUES (?, ?, ?, ?)',
    [nome, cpf, email, id_escola], (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar professor' });
      res.json(results);
    });
});
app.delete('/professores/:id', (req, res) => {
  connection.query('DELETE FROM professores WHERE id_professor = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir professor' });
    res.json(results);
  });
});

// --- DISCIPLINAS ---
app.get('/disciplinas', (req, res) => {
  connection.query('SELECT * FROM disciplinas', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar disciplinas' });
    res.json(results);
  });
});
app.post('/disciplinas', (req, res) => {
  const { nome, carga_horaria } = req.body;
  connection.query('INSERT INTO disciplinas (nome, carga_horaria) VALUES (?, ?)',
    [nome, carga_horaria], (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar disciplina' });
      res.json(results);
    });
});
app.delete('/disciplinas/:id', (req, res) => {
  connection.query('DELETE FROM disciplinas WHERE id_disciplina = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir disciplina' });
    res.json(results);
  });
});

// --- TURMAS ---
app.get('/turmas', (req, res) => {
  connection.query('SELECT * FROM turmas', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar turmas' });
    res.json(results);
  });
});
app.post('/turmas', (req, res) => {
  const { serie, ano_letivo, chamada, capacidade } = req.body;
  connection.query('INSERT INTO turmas (serie, ano_letivo, chamada, capacidade) VALUES (?, ?, ?, ?)',
    [serie, ano_letivo, chamada, capacidade], (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar turma' });
      res.json(results);
    });
});
app.delete('/turmas/:id', (req, res) => {
  connection.query('DELETE FROM turmas WHERE id_turma = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir turma' });
    res.json(results);
  });
});

// --- ALUNOS ---
app.get('/alunos', (req, res) => {
  connection.query('SELECT * FROM alunos', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar alunos' });
    res.json(results);
  });
});
app.post('/alunos', (req, res) => {
  const { nome, cpf, data_nascimento } = req.body;
  connection.query('INSERT INTO alunos (nome, cpf, data_nascimento) VALUES (?, ?, ?)',
    [nome, cpf, data_nascimento], (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar aluno' });
      res.json(results);
    });
});
app.delete('/alunos/:id', (req, res) => {
  connection.query('DELETE FROM alunos WHERE id_aluno = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir aluno' });
    res.json(results);
  });
});

// --- DASHBOARD (Rotas vazias para não quebrar a tela inicial) ---
app.get('/matriculas', (req, res) => res.json([]));
app.get('/frequencia', (req, res) => res.json([]));

// Inicia o Servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/`);
});