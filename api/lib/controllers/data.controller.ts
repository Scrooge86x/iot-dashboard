import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import Controller from '../interfaces/controller.interface';
import DataService from '../modules/services/data.service';

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAll);
        this.router.post(this.path, this.addItem);
        this.router.delete(`${this.path}/:id`, this.deleteItem);
    }

    private getAll = async (request: Request, response: Response) => {
        try {
            const data = await this.dataService.getAll();
            response.status(StatusCodes.OK).json(data);
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    private addItem = async (request: Request, response: Response) => {
        const { body } = request;
        try {
            const newItem = await this.dataService.addItem(body);
            response.status(StatusCodes.CREATED).json(newItem);
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    private deleteItem = async (request: Request, response: Response) => {
        const itemId = request.params.id;
        try {
            await this.dataService.deleteItem(itemId);
            response.sendStatus(StatusCodes.NO_CONTENT);
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}

export default DataController;