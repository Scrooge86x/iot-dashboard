import App from './app';
import ItemController from './controllers/item.controller';
import IndexController from './controllers/index.controller';
import DataController from './controllers/data.controller';
import MeasurementsController from './controllers/measurements.controller';

const app = new App();
const controllers = [
    new DataController(),
    new ItemController(),
    new MeasurementsController(app.getIo()),
    new IndexController(app.getIo()),
];
for (const controller of controllers) {
    app.app.use('/', controller.router);
}

app.listen();
