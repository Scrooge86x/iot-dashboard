import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';

import Controller from '../interfaces/controller.interface';

class MeasurementsController implements Controller {
    public path = '/api/measurements';
    public router = Router();
    private io: Server;

    constructor(io: Server) {
        this.io = io;

        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(this.path, this.addMeasurement);
    }

    private addMeasurement = async (request: Request, response: Response) => {
        const { body } = request;
        console.log(body);
        try {
            this.io.emit('new-measurement', body);
            response.sendStatus(StatusCodes.NO_CONTENT);
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}

export default MeasurementsController;