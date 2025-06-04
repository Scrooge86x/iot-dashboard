import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../modules/models/user.model';
import { StatusCodes } from 'http-status-codes';

export const auth = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    let token =
        request.headers['x-access-token'] || request.headers['authorization'];
    if (token && typeof token === 'string') {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        try {
            jwt.verify(token, config.JwtSecret, (err, decoded) => {
                if (err) {
                    return response.status(StatusCodes.BAD_REQUEST).send('Invalid token.');
                }
                const user: IUser = decoded as IUser;
                next();
                return;
            });
        } catch (ex) {
            return response.status(StatusCodes.BAD_REQUEST).send('Invalid token.');
        }
    } else {
        return response.status(StatusCodes.UNAUTHORIZED).send('Access denied. No token provided.');
    }
};
