import Controller from '../interfaces/controller.interface';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { checkIdParam } from '../middlewares/checkIdParam.middleware';
import { auth } from '../middlewares/auth.middleware';
import DataService from '../modules/services/data.service';
import { IData } from 'modules/models/data.model';
import { config } from '../config';
import Joi from 'joi';

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();

    constructor(private dataService: DataService) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/latest`,
            auth,
            this.getLatestReadingsFromAllDevices
        );
        this.router.get(
            `${this.path}/lasthour`,
            auth,
            this.getAllReadingsFromLastHour
        );
        this.router.get(
            `${this.path}/:id/latest`,
            auth,
            checkIdParam,
            this.getLatestReading
        );
        this.router.get(
            `${this.path}/:id/:num`,
            auth,
            checkIdParam,
            this.getPeriodData
        );
        this.router.get(
            `${this.path}/:id`,
            auth,
            checkIdParam,
            this.getAllDeviceData
        );
        this.router.delete(`${this.path}/all`, auth, this.cleanAllDevices);
        this.router.delete(
            `${this.path}/:id`,
            auth,
            checkIdParam,
            this.cleanDeviceData
        );
        this.router.post(`${this.path}/:id`, auth, checkIdParam, this.addData);
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

    private getAllReadingsFromLastHour = async (
        request: Request,
        response: Response
    ) => {
        try {
            const lastHourData = await this.dataService.getAllFromLastHour();
            response.status(StatusCodes.OK).json(lastHourData);
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
            const { from, to } = request.body;
            if (!from || !to) {
                await this.dataService.deleteData(id);
                return response.sendStatus(StatusCodes.NO_CONTENT);
            }

            const fromDate = new Date(from);
            const toDate = new Date(to);
            if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                return response
                    .status(StatusCodes.BAD_REQUEST)
                    .send('Error: invalid date range specified.');
            }

            await this.dataService.deleteDataInRange(id, fromDate, toDate);
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
        const { air } = request.body;

        const schema = Joi.object({
            air: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().integer().positive().required(),
                        value: Joi.number().positive().required(),
                    })
                )
                .unique((a, b) => a.id === b.id),
            deviceId: Joi.number()
                .integer()
                .positive()
                .valid(parseInt(id, 10))
                .required(),
        });

        try {
            const validatedData = await schema.validateAsync({
                air,
                deviceId: parseInt(id, 10),
            });
            const readingData: IData = {
                temperature: validatedData.air[0].value,
                pressure: validatedData.air[1].value,
                humidity: validatedData.air[2].value,
                deviceId: validatedData.deviceId,
            };

            await this.dataService.createData(readingData);
            response.status(StatusCodes.OK).json(readingData);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Invalid input data.' });
        }
    };
}

export default DataController;
