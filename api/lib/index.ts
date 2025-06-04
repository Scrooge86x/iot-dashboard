import App from './app';
import DataController from './controllers/data.controller';
import IndexController from './controllers/index.controller';
import UserController from './controllers/user.controller';

const app: App = new App([
    new UserController(),
    new DataController(),
    new IndexController(),
]);

app.listen();
