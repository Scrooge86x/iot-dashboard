import { Request, Response, Router } from 'express';
import path from 'path';

import Controller from '../interfaces/controller.interface';

class IndexController implements Controller {
    public path = '/*';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.serveIndex);
    }

    private serveIndex = async (request: Request, response: Response) => {
        response.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
}

export default IndexController;
