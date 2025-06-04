import App from './app';
import { Server } from 'socket.io';
import Controller from './interfaces/controller.interface';
import DataController from './controllers/data.controller';
import IndexController from './controllers/index.controller';
import UserController from './controllers/user.controller';
import DataService from './modules/services/data.service';

const createControllers = (io: Server): Controller[] => {
    const dataService = new DataService();
    return [
        new UserController(),
        new DataController(dataService),
        new IndexController(io),
    ];
};

const app: App = new App();
createControllers(app.getIo()).forEach((controller) => {
    app.app.use('/', controller.router);
});
app.listen();
