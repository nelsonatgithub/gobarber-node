import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import CrudBarberServiceService from '../../../services/baberservice/implementations/CrudBarberServiceService';
import CrudServiceTypeService from '../../../services/barberServiceType/implementations/CrudBarbershopService';

import AppError from '../../../errors/AppError';
import CrudBarbershopService from '../../../services/babershop/implementations/CrudBarbershopService';
import { RetrieveAllBarberServiceInput } from '../../../services/baberservice/interfaces/CrudBarberService';

const router = Router();

router.get('/', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershopId,
            serviceTypeId,
            priceMin,
            priceMax,
        } = request.query;

        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudServiceTypeService = container.resolve(CrudServiceTypeService);

        const retrieveOptions = {} as RetrieveAllBarberServiceInput;

        if (typeof barbershopId === 'string') {
            const { barbershop } = await crudBarbershopService.retrieve({
                id: barbershopId,
            });

            if (!barbershop) {
                return next(new AppError(`Provided barbershop ${barbershopId} does not exist`));
            }
            retrieveOptions.provider = barbershop;
        }

        if (typeof serviceTypeId === 'string') {
            const { serviceType } = await crudServiceTypeService.retrieve({
                id: serviceTypeId,
            });

            if (!serviceType) {
                return next(new AppError(`Provided ServiceType ${serviceTypeId} does not exist`));
            }
            retrieveOptions.type = serviceType;
        }

        if (priceMin || priceMax) {
            retrieveOptions.price = {};
            if (Number(priceMin)) {
                retrieveOptions.price.ge = Number(priceMin);
            }
            if (Number(priceMax)) {
                retrieveOptions.price.le = Number(priceMax);
            }
        }

        const { serviceList } = await crudBarberServiceService.retrieveAll(retrieveOptions);
        return response.status(200).json({ serviceList });
    } catch (error) {
        return next(error);
    }
});

export default router;
