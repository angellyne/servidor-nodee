const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');


const app = express();
const port = 3000;

// Use o cors
app.use(cors());

// Middleware para o Express enternder JSON no corpo da requisição (req.body)
app.use(express.json());


// 1. Configura a conexão com o MySQL
const connection = mysql.createConnection({
  host: 'localhost',
 user: 'root',
    password: '',
   database: 'educontrol'
});

// Conecta ao banco de dados
connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL: ', err.stack );
      return;
    }
    console.log('Conectado ao MySQL com sucesso!');

    // Cria a tabela 'alunos'  caso ela não exista
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS alunos(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      )`;
      connection.query( createTableQuery, (err) => {
        if (err) {
          console.error('Erro ao criar tabela: ', err.stack );
          return;
        }
      } );



    // Cria a tabela 'turmas' caso ela não exista
    const createTurmasTableQuery = `
      CREATE TABLE IF NOT EXISTS turmas(
        id INT AUTO_INCREMENT PRIMARY KEY,
        serie VARCHAR(255) NOT NULL,
        ano_letivo INT NOT NULL,
        chamada VARCHAR(255) NOT NULL,
        capacidade INT NOT NULL
      )`;
    connection.query( createTurmasTableQuery, (err) => {
      if (err) {
        console.error('Erro ao criar tabela: ', err.stack );
        return;
      }
    } );
















    });

app.get('/alunos', (req, res) => {
  connection.query('SELECT * FROM alunos', (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar alunos'});
    }
    res.json(results);
  });
});


app.post('/turmas', (req, res) => {
  const { serie, ano_letivo, chamada, capacidade } = req.body;
  connection.query(
    'INSERT INTO turmas (serie, ano_letivo, chamada, capacidade) VALUES (?, ?, ?, ?)',
    [serie, ano_letivo, chamada, capacidade],
    (err, results) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao criar turma'});
      }
      res.json(results);
    }
  );
});

app.get('/turmas', (req, res) => {
  connection.query('SELECT * FROM turmas', (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar turmas'});
    }
    res.json(results);
  });
});
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/`);
});

