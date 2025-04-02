import { StatusCodes } from 'http-status-codes';
import Controller from '../interfaces/controller.interface';
import { Request, Response, Router } from 'express';

type Items = Record<string, string>;

class ItemController implements Controller {
    public path = '/api/items';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getItem);
        this.router.put(`${this.path}/:id`, this.updateItem);
        this.router.delete(`${this.path}/:id`, this.deleteItem);
        this.router.post(this.path, this.addItem);
        this.router.get(this.path, this.getAllItems);
    }

    private addItem = async (request: Request, response: Response) => {
        const { body: { id, value } } = request;
        if (!id || !value) {
            response.status(StatusCodes.BAD_REQUEST).send('Error: id or value not specified.');
            return;
        }

        if (id in this.items) {
            response.status(StatusCodes.CONFLICT).send(`Error: item with id "${id}" already exists.`);
            return;
        }

        this.items[id] = value;
        response.status(StatusCodes.CREATED).json(value);
    }

    private getAllItems = async (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json(this.items);
    }

    private getItem = async (request: Request, response: Response) => {
        const { id } = request.params;
        if (!(id in this.items)) {
            response.status(StatusCodes.NOT_FOUND).send(`Item with id of "${id}" was not found.`);
            return;
        }

        response.status(StatusCodes.OK).json(this.items[id]);
    }

    private updateItem = async (request: Request, response: Response) => {
        const { id } = request.params;
        if (!(id in this.items)) {
            response.status(StatusCodes.NOT_FOUND).send(`Item with id of "${id}" was not found.`);
            return;
        }

        const { body: { value } } = request;
        if (!value) {
            response.status(StatusCodes.BAD_REQUEST).send('Error: value was not specified.');
            return;
        }

        this.items[id] = value;
        response.sendStatus(StatusCodes.NO_CONTENT);
    }

    private deleteItem = async (request: Request, response: Response) => {
        const { id } = request.params;
        if (!(id in this.items)) {
            response.status(StatusCodes.NOT_FOUND).send(`Item with id of "${id}" was not found.`);
            return;
        }

        delete this.items[id];
        response.sendStatus(StatusCodes.NO_CONTENT);
    }

    private items: Items = {};
}

export default ItemController;
