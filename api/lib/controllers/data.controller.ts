import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

class DataController implements Controller {
  public path = '/api/data';
  public router = Router();
  private testData = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/latest`,
      this.getLatestReadingsFromAllDevices
    );
    this.router.get(`${this.path}/:id/latest`, this.getLatestReadingById);
    this.router.get(`${this.path}/:id/:num`, this.getReadingsInRange);
    this.router.get(`${this.path}/:id`, this.getReadingById);
    this.router.delete(`${this.path}/all`, this.deleteAllReadings);
    this.router.delete(`${this.path}/:id`, this.deleteReadingById);
    this.router.post(`${this.path}/:id`, this.addData);
  }

  private parseId = (id: string, response: Response): number => {
    const numId = parseFloat(id);
    if (isNaN(numId) || !Number.isInteger(numId)) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send(`id: "${numId}" is invalid. It must be an integer.`);
      return null;
    }
    if (numId >= this.testData.length) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send(
          `id: "${numId}" is out of range. Max id is: ${
            this.testData.length - 1
          }`
        );
      return null;
    }
    return numId;
  };

  private getReadingById = async (request: Request, response: Response) => {
    const id = this.parseId(request.params.id, response);
    if (!id) {
      return;
    }

    response.status(StatusCodes.OK).send(`${this.testData[id]}`);
  };

  private getLatestReadingById = async (
    request: Request,
    response: Response
  ) => {
    // Not used yet
    // const id = this.parseId(request.params.id, response);
    // if (!id) {
    //   return;
    // }

    response.status(StatusCodes.OK).send(`${Math.max(...this.testData)}`);
  };

  private getReadingsInRange = async (request: Request, response: Response) => {
    const id = this.parseId(request.params.id, response);
    const num = this.parseId(request.params.num, response);
    if (!id || !num) {
      return;
    }

    const readings = this.testData.slice(id, id + num);
    response.status(StatusCodes.OK).json(readings);
  };

  private deleteReadingById = async (request: Request, response: Response) => {
    const id = this.parseId(request.params.id, response);
    if (!id) {
      return;
    }

    this.testData.splice(id, 1);
    response.sendStatus(StatusCodes.NO_CONTENT);
  };

  private deleteAllReadings = async (request: Request, response: Response) => {
    this.testData.length = 0;
    response.sendStatus(StatusCodes.NO_CONTENT);
  };

  private getLatestReadingsFromAllDevices = async (
    request: Request,
    response: Response
  ) => {
    response.status(StatusCodes.OK).json(this.testData);
  };

  private addData = async (request: Request, response: Response) => {
    const { elem } = request.body;
    if (!elem) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send('Elem as not specified in the request.');
      return;
    }

    this.testData.push(elem);
    response.status(StatusCodes.OK).json(this.testData);
  };
}

export default DataController;
