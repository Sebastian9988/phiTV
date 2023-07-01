const http = require("http");
const fs = require("fs");
const net = require('net');

let currentPort = 3300; // Puerto inicial

const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

const startTransmition = async () => {
    // console.log('currentPort', currentPort)

  const portInUse = await isPortInUse(currentPort);
  if (portInUse) {
    console.error(`El puerto ${currentPort} está en uso.`);
    return;
  }

  http
    .createServer((req, res) => {
      const videoPath = "uploads/taylorSwift.mp4"; // Ruta al archivo de video que deseas transmitir

      fs.stat(videoPath, (err, stats) => {
        if (err) {
          console.error("Error al leer el archivo de video:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error interno del servidor");
          return;
        }

        // Configurar encabezados para indicar que se transmitirá un video
        res.writeHead(200, {
          "Content-Type": "video/mp4",
          "Content-Length": stats.size,
        });

        // Crear un flujo de lectura del archivo de video
        const videoStream = fs.createReadStream(videoPath);

        // Transmitir el video a medida que se va leyendo
        videoStream.pipe(res);

        // Manejar evento de error de transmisión
        videoStream.on("error", (err) => {
          console.error("Error al transmitir el video:", err);
          res.sendStatus(500);
        });
      });
    })
    .listen(currentPort, () => {
      console.log(`Servidor de streaming de video iniciado en el puerto ${currentPort}`);
      currentPort++; // Incrementar el puerto para el próximo cliente
    });
};

module.exports = {
  startTransmition,
};
