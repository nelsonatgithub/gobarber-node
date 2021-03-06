import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import CrudBarbershopService from '../../../services/babershop/implementations/CrudBarbershopService';
import identifyBarbershop from '../../middlewares/IdentifyBarbershop';
import Barbershop from '../../../database/models/Barbershop';
import AppError from '../../../errors/AppError';

/*
    Use case
        Barbershop self account management
 */
const router = Router();

router.post('', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: {
                name,
                address,
            },
        } = request.body;

        const { user } = request;

        const crudBarbershopService = container.resolve(CrudBarbershopService);

        const {
            barbershop: existingBarbershop,
        } = await crudBarbershopService.retrieve({ owner: user });

        if (existingBarbershop) {
            return next(new AppError('User already has a barbershop'));
        }

        const { barbershop } = await crudBarbershopService.create({
            owner: user,
            name,
            address,
        });

        return response.status(200).json({ barbershop });
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const { id: barbershopId } = request.params;

        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const {
            barbershop: retrievedBarbershop,
        } = await crudBarbershopService.retrieve({ id: barbershopId });

        if (!retrievedBarbershop) {
            return next(new AppError('Barbershop not found'));
        }

        return response.status(200).json({ barbershop: retrievedBarbershop });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: {
                name,
                slogan,
                address,
                description,
            },
        } = request.body;

        const {
            id: barbershopId,
        } = request.params;

        const { barbershop } = request;

        if (!barbershop) {
            return next(new AppError('Unauthorized', 401));
        }

        if (barbershopId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const crudBarbershopService = container.resolve(CrudBarbershopService);

        /* Compose new shop profile to update */
        const newShopProfile = { ...barbershop } as Barbershop;

        if (name) newShopProfile.name = name;
        if (slogan) newShopProfile.slogan = slogan;
        if (address) newShopProfile.address = address;
        if (description) newShopProfile.description = description;

        const { barbershop: updatedBarbershop } = await crudBarbershopService.update({
            id: barbershop.id,
            description,
            name,
            slogan,
            address,
        });

        return response.status(200).json({ barbershop: updatedBarbershop });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            id: barbershopId,
        } = request.params;

        const { barbershop } = request;

        if (!barbershop) {
            return next(new AppError('Unauthorized', 401));
        }

        if (barbershopId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const crudBarbershopService = container.resolve(CrudBarbershopService);

        const { barbershop: deletedBarbershop } = await crudBarbershopService.delete({
            id: barbershop.id,
        });

        return response.status(200).json({ barbershop: deletedBarbershop });
    } catch (error) {
        return next(error);
    }
});

export default router;
