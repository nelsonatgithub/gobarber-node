import 'reflect-metadata';

import sendgrid from '@sendgrid/mail';
import { singleton } from 'tsyringe';
import {
    EmailServiceInterface,
    MailData,
    SendMailResult,
} from '../interfaces/EmaiServicelInterface';
import AppError from '../../errors/AppError';

@singleton()
class SendGridService implements EmailServiceInterface {
    constructor(
        /* manual injection through process.env */
        private apiKey: string,
    ) {}

    /**
     * Implementation to sendGrid
     */
    async sendMail({
        subject,
        message,
        to,
        from,
    }: MailData): Promise<SendMailResult> {
        if (!this.apiKey) {
            throw new AppError('Email is not configured properly. Missing api key');
        }

        sendgrid.setApiKey(this.apiKey);

        if (!subject || !message || !to || !from) {
            throw new AppError('Missing email props');
        }

        const response = await sendgrid.send({
            from,
            subject,
            to,
            text: message,
        } as sendgrid.MailDataRequired);

        const [{
            statusCode,
            headers,
        }] = response;

        return {
            status: statusCode >= 200 && statusCode < 300 ? 'ok' : 'failed',
            data: headers,
        };
    }
}

export default SendGridService;
