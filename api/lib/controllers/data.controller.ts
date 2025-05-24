import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import DataService from '../modules/services/data.service';
import { IData } from 'modules/models/data.model';
import { config } from '../config';

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/latest`,
            this.getLatestReadingsFromAllDevices
        );
        this.router.get(
            `${this.path}/:id/latest`,
            checkIdParam,
            this.getLatestReading
        );
        this.router.get(
            `${this.path}/:id/:num`,
            checkIdParam,
            this.getPeriodData
        );
        this.router.get(
            `${this.path}/:id`,
            checkIdParam,
            this.getAllDeviceData
        );
        this.router.delete(`${this.path}/all`, this.cleanAllDevices);
        this.router.delete(
            `${this.path}/:id`,
            checkIdParam,
            this.cleanDeviceData
        );
        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
    }

    private getAllDeviceData = async (request: Request, response: Response) => {
        const { id } = request.params;
        try {
            const allData = await this.dataService.query(id);
            response.status(StatusCodes.OK).json(allData);
        } catch (error) {
            console.error(error.message);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    private getLatestReading = async (request: Request, response: Response) => {
        const { id } = request.params;
        try {
            const latestData = await this.dataService.get(id, 1);
            response.status(StatusCodes.OK).json(latestData);
        } catch (error) {
            console.error(error.message);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    private getPeriodData = async (request: Request, response: Response) => {
        const { id, num } = request.params;
        const iNum = parseInt(num);
        if (isNaN(iNum)) {
            response
                .status(StatusCodes.BAD_REQUEST)
                .send(
                    `Error: parameter num was not a number. Specified value: "${num}".`
                );
            return;
        }

        try {
            const latestData = await this.dataService.get(id, iNum);
            response.status(StatusCodes.OK).json(latestData);
        } catch (error) {
            console.error(error.message);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    private cleanDeviceData = async (request: Request, response: Response) => {
        try {
            const { id } = request.params;
            await this.dataService.deleteData(id);
            response.sendStatus(StatusCodes.NO_CONTENT);
        } catch (error) {
            console.error(error.message);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    private cleanAllDevices = async (request: Request, response: Response) => {
        try {
            for (let i = 0; i < config.supportedDevicesNum; ++i) {
                await this.dataService.deleteData(i.toString());
            }
            response.sendStatus(StatusCodes.NO_CONTENT);
        } catch (error) {
            console.error(error.message);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    private getLatestReadingsFromAllDevices = async (
        request: Request,
        response: Response
    ) => {
        try {
            const newestData = await this.dataService.getAllNewest();
            response.status(StatusCodes.OK).json(newestData);
        } catch (error) {
            console.error(error.message);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    private addData = async (request: Request, response: Response) => {
        const { id } = request.params;
        try {
            const { air } = request.body;

            const data: IData = {
                temperature: air[0].value,
                pressure: air[1].value,
                humidity: air[2].value,
                deviceId: parseInt(id),
                readingDate: new Date(),
            };

            await this.dataService.createData(data);
            response.status(StatusCodes.OK).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Invalid input data.' });
        }
    };
}

export default DataController;
