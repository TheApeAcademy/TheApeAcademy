/**
 * Regions data (hardcoded for MVP – consider moving to DB later)
 */
const REGIONS = {
  'West Africa': {
    countries: ['Nigeria', 'Ghana', 'Senegal', 'Côte d\'Ivoire', 'Benin'],
  },
  'East Africa': {
    countries: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia', 'Rwanda'],
  },
  'Southern Africa': {
    countries: ['South Africa', 'Botswana', 'Zimbabwe', 'Lesotho'],
  },
  'Central Africa': {
    countries: ['Cameroon', 'Congo', 'Gabon', 'Chad', 'Central African Republic'],
  },
  'North Africa': {
    countries: ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya'],
  },
};

export const RegionController = {
  /**
   * GET /regions – List all regions
   */
  async getRegions(req, res, next) {
    try {
      const regions = Object.keys(REGIONS);
      res.status(200).json({
        regions,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /regions/:region/countries – List countries in a region
   */
  async getCountries(req, res, next) {
    try {
      const { region } = req.params;

      if (!REGIONS[region]) {
        return res.status(404).json({
          error: {
            message: 'Region not found',
            statusCode: 404,
          },
        });
      }

      res.status(200).json({
        region,
        countries: REGIONS[region].countries,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default RegionController;
