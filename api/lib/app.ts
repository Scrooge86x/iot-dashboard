import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http';
import { Server, Socket } from 'socket.io';

import { config } from './config';

interface UserMessage {
  recipientId: string;
  content: string;
}

class App {
  public app: express.Application;
  public io: Server;
  private server: http.Server;
  private sensorDataInterval: NodeJS.Timeout;
  private users = new Map<string, string>();

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.initializeMiddlewares();
    this.initializeSocket();
    this.connectToDatabase();
  }

  private async connectToDatabase(): Promise<void> {
    mongoose.set('debug', true);
    console.log('Połączono z bazą: ', mongoose.connection.name);
    try {
      // Próba nawiązania połączenia z bazą danych MongoDB
      const { DB_PASSWORD } = process.env;
      if (!DB_PASSWORD) {
        console.error(
          'DB_PASSWORD was not set. Use "$env:DB_PASSWORD", "set DB_PASSWORD" or "export DB_PASSWORD"'
        );
        return;
      }
      await mongoose.connect(
        config.databaseUrl.replace('<db_password>', process.env.DB_PASSWORD)
      );
      console.log('Connection with database established');
    } catch (error) {
      // Obsługa błędu w przypadku nieudanego połączenia
      console.error('Error connecting to MongoDB:', error);
    }

    // Obsługa błędów połączenia po jego ustanowieniu
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    // Obsługa zdarzenia rozłączenia z bazą danych
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Nasłuchiwanie sygnału zamknięcia aplikacji (np. `Ctrl + C` lub `SIGINT` w systemach UNIX)
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      // Zamknięcie połączenia z bazą danych przed zakończeniem procesu
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.json());
  }

  private initializeSocket(): void {
    this.io = new Server(this.server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Nowe połączenie: ${socket.id}`);

      if (!this.sensorDataInterval) {
        this.sensorDataInterval = setInterval(() => {
          this.io.emit('sensor-data', {
            temperature: Math.random() * 30,
            humidity: 55,
            pressure: 1005,
            deviceId: 1,
          });
        }, 3000);
      }

      socket.on('message', (message: UserMessage) => {
        console.log(`Wiadomość od ${socket.id}: ${message.content}`);
        this.io.emit('message', {
          from: this.users.get(socket.id),
          to: null,
          content: message.content,
        });
      });

      socket.on('set-nickname', (nickname: string) => {
        this.users.set(socket.id, nickname);
        this.io.emit('user-list', Array.from(this.users));
      });

      socket.on('private-message', ({ recipientId, content }: UserMessage) => {
        const from = this.users.get(socket.id);
        const to = this.users.get(recipientId);
        this.io.to(recipientId).emit('private-message', {
          from,
          to,
          content,
        });
        this.io.to(socket.id).emit('private-message', {
          from,
          to,
          content,
        });
      });

      socket.on('disconnect', () => {
        console.log(`Rozłączono: ${socket.id}`);
        this.users.delete(socket.id);
        this.io.emit('user-list', Array.from(this.users));

        if (this.io.engine.clientsCount === 0) {
          clearInterval(this.sensorDataInterval);
          this.sensorDataInterval = null;
        }
      });
    });

    this.server.listen(config.socketPort, () => {
      console.log(`WebSocket listening on port ${config.socketPort}`);
    });
  }

  public getIo(): Server {
    return this.io;
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`App listening on the port ${config.port}`);
    });
  }
}

export default App;
