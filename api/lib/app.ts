import express from 'express';
import cors from 'cors';
import { config } from './config';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { logRequest } from './middlewares/logRequest.middleware';
import { Server } from 'socket.io';

class App {
    public app: express.Application;
    private io: Server;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.connectToDatabase();
    }

    public getIo(): Server {
        return this.io;
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParser.json());
        this.app.use(logRequest);
        this.app.use(
            cors({
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            })
        );
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
}

export default App;
