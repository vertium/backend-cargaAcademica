const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuración de MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cargaacademica'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de CORS para permitir todas las solicitudes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); // Reemplaza con el origen de tu frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Ruta para buscar los datos en la base de datos
app.post('/buscar-datos', (req, res) => {
  const { rut, nombre, año } = req.body;
  
  // Realizar la consulta en la base de datos, uniendo con la tabla de jerarquías para obtener el nombre de la jerarquía
  const query = `
    SELECT profesor.*, jerarquia.NombreJ
    FROM profesor
    JOIN jerarquia ON profesor.idJerarquia = jerarquia.idJerarquia
    WHERE CONCAT(profesor.Nombre, ' ', profesor.Apellido) LIKE ? OR profesor.idProfesor = ?
  `;
  const values = [`%${nombre}%`, rut];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al buscar datos:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }
    console.log('Datos encontrados:', result);
    res.status(200).json(result);
  });
})

// Ruta para obtener las hora máximas de docencia desde la tabla jerarquia
app.get('/obtener-hora-maxima-docencia/:idJerarquia', (req, res) => {
  const idJerarquia = req.params.idJerarquia;

  // Realizar la consulta en la base de datos para obtener las horas máximas de docencia
  const query = `
    SELECT horaMaximaDeDocencia
    FROM jerarquia
    WHERE idJerarquia = ?
  `;
  const values = [idJerarquia];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al obtener las horas máximas de docencia:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }

    if (result && result.length > 0) {
      const horaMaximaDeDocencia = result[0].horaMaximaDeDocencia;
      res.status(200).json({ horaMaximaDeDocencia });
    } else {
      console.error('No se encontraron las horas máximas de docencia.');
      res.status(404).send('No se encontraron las horas máximas de docencia');
    }
  });
});

//Docencia Directa

// Nueva ruta para guardar datos de asignatura, horas y minutos en la base de datos
app.post('/guardar-datos', (req, res) => {
  const { horas, minutos } = req.body;
console.log({horas,minutos})
  // Realizar la consulta SQL para insertar los datos en la base de datos
  db.query('INSERT INTO cargadocente (HorasPlanificacion,Horas_Minutos) VALUES (?,?)',[horas,minutos],(err,result)=>{
    if (err){
      res.status(500).send('Error')
    }
  })
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
