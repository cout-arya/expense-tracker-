import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient
} from '../controllers/clientController.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Client routes
router.route('/')
    .post(createClient)
    .get(getClients);

router.route('/:id')
    .get(getClientById)
    .put(updateClient)
    .delete(deleteClient);

export default router;
