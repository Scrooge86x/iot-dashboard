import { IData } from '../models/data.model';
import DataModel from '../schemas/data.schema';

export default class DataService {
    public async getAll() {
        try {
            return await DataModel.find();
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async addItem(item: IData) {
        try {
            return await DataModel.create(item);
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async deleteItem(id: string) {
        try {
            return await DataModel.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }
}
