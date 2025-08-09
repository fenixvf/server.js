const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors());
const upload = multer();

app.post('/vocalremove', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('Arquivo não enviado');

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const response = await fetch('https://vocalremover.org/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return res.status(response.status).send('Erro ao processar áudio');
    }

    const json = await response.json();
    if (!json.output_file) {
      return res.status(500).send('Resposta inválida da API vocal remove');
    }

    const audioResponse = await fetch(json.output_file);
    if (!audioResponse.ok) {
      return res.status(500).send('Erro ao buscar áudio instrumental');
    }

    res.set('Content-Type', 'audio/wav');
    audioResponse.body.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor');
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Backend rodando na porta ' + listener.address().port);
});
