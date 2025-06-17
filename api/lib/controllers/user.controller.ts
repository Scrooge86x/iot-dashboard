import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import UserService from '../modules/services/user.service';
import PasswordService from '../modules/services/password.service';
import TokenService from '../modules/services/token.service';
import { StatusCodes } from 'http-status-codes';
import generator from 'generate-password-ts';
import nodemailer from 'nodemailer';

class UserController implements Controller {
    public path = '/api/user';
    public router = Router();
    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.patch(`${this.path}/reset`, this.resetPassword);
        this.router.delete(
            `${this.path}/logout/:userId`,
            auth,
            this.removeHashSession
        );
    }

    private authenticate = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { login, password } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({ error: 'Unauthorized: user not found' });
            }

            const isAuthorized = await this.passwordService.authorize(
                user._id,
                password
            );
            if (!isAuthorized) {
                return response
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({ error: 'Unauthorized: password not matching' });
            }

            const token = await this.tokenService.create(user);
            response
                .status(StatusCodes.OK)
                .json(this.tokenService.getToken(token));
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ error: 'Unauthorized' });
        }
    };

    private createNewOrUpdate = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const userData = request.body;
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(
                    userData.password
                );
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword,
                });
            }
            response.status(StatusCodes.OK).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Bad request', value: error.message });
        }
    };

    private resetPassword = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { email } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(email);
            if (!user) {
                return response.sendStatus(StatusCodes.NOT_FOUND);
            }

            const plainTextPassword = generator.generate({
                length: 10,
                numbers: true,
            });

            const hashedPassword = await this.passwordService.hashPassword(
                plainTextPassword
            );
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword,
            });
            await this.sendPasswordToEmail(plainTextPassword, user.email);
            response
                .status(StatusCodes.OK)
                .send(`New password sent to ${user.email}.`);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ error: 'Unauthorized' });
        }
    };

    private removeHashSession = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { userId } = request.params;

        try {
            const result = await this.tokenService.remove(userId);
            response.status(StatusCodes.OK).send(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ error: 'Unauthorized' });
        }
    };

    private sendPasswordToEmail = async (password: string, email: string) => {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from: '"IoT" <iot@example.com>',
            to: email,
            subject: 'Your new password.',
            text: `Your new password is ${password}.`,
        });
        console.log('Email URL:', nodemailer.getTestMessageUrl(info));
    };
}

export default UserController;
