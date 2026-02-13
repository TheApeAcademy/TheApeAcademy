import express from 'express';
import { RegionController } from '../controllers/region.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';

const router = express.Router();

/**
 * GET /regions
 * List all regions
 */
router.get('/', asyncHandler((req, res, next) => RegionController.getRegions(req, res, next)));

/**
 * GET /regions/:region/countries
 * List countries in a specific region
 */
router.get('/:region/countries', asyncHandler((req, res, next) => RegionController.getCountries(req, res, next)));

export default router;
