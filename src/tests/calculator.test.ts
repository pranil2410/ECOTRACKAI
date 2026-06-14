import { 
  calculateTransportEmissions, 
  calculateEnergyEmissions, 
  calculateFoodEmissions, 
  calculateWasteEmissions,
  computeEmissionsForCategory,
  EMISSION_FACTORS 
} from '../utils/carbonCalculations';

describe('Carbon Calculator Emissions Formulas', () => {
  
  describe('Transportation Category', () => {
    test('should calculate petrol car emissions correctly', () => {
      const distance = 100; // km
      const result = calculateTransportEmissions({
        sub_category: 'car',
        distanceKm: distance,
        fuelType: 'petrol'
      });
      expect(result).toBe(distance * EMISSION_FACTORS.transport.car_petrol);
    });

    test('should calculate electric car emissions correctly', () => {
      const distance = 50; // km
      const result = calculateTransportEmissions({
        sub_category: 'car',
        distanceKm: distance,
        fuelType: 'electric'
      });
      expect(result).toBe(distance * EMISSION_FACTORS.transport.car_electric);
    });

    test('should calculate flight emissions based on flight hours', () => {
      const hours = 5; // hours
      const result = calculateTransportEmissions({
        sub_category: 'flight',
        flightHours: hours
      });
      expect(result).toBe(hours * EMISSION_FACTORS.transport.flight);
    });

    test('should calculate bus and train emissions correctly', () => {
      const distance = 20;
      const busResult = calculateTransportEmissions({ sub_category: 'bus', distanceKm: distance });
      const trainResult = calculateTransportEmissions({ sub_category: 'train', distanceKm: distance });
      
      expect(busResult).toBe(distance * EMISSION_FACTORS.transport.bus);
      expect(trainResult).toBe(distance * EMISSION_FACTORS.transport.train);
    });

    test('should return 0 for bike emissions', () => {
      const distance = 100;
      const result = calculateTransportEmissions({ sub_category: 'bike', distanceKm: distance });
      expect(result).toBe(0);
    });
  });

  describe('Energy Category', () => {
    test('should calculate electricity grid carbon impact correctly', () => {
      const kwh = 200;
      const result = calculateEnergyEmissions({ sub_category: 'electricity', kwh });
      expect(result).toBe(kwh * EMISSION_FACTORS.energy.electricity);
    });

    test('should calculate LPG cylinder carbon impact correctly', () => {
      const lpgKg = 14.2;
      const result = calculateEnergyEmissions({ sub_category: 'lpg', lpgKg });
      expect(result).toBe(lpgKg * EMISSION_FACTORS.energy.lpg);
    });
  });

  describe('Food Category', () => {
    test('should calculate vegetarian diet impact', () => {
      const days = 7;
      const result = calculateFoodEmissions({ sub_category: 'vegetarian', days });
      expect(result).toBe(days * EMISSION_FACTORS.food.vegetarian);
    });

    test('should calculate meat-heavy diet impact', () => {
      const days = 3;
      const result = calculateFoodEmissions({ sub_category: 'non_vegetarian', days });
      expect(result).toBe(days * EMISSION_FACTORS.food.non_vegetarian);
    });
  });

  describe('Waste Category', () => {
    test('should calculate plastic packaging waste impact', () => {
      const weight = 5.5; // kg
      const result = calculateWasteEmissions({ sub_category: 'plastic', weightKg: weight });
      expect(result).toBe(weight * EMISSION_FACTORS.waste.plastic);
    });

    test('should calculate paper waste impact', () => {
      const weight = 12.0; // kg
      const result = calculateWasteEmissions({ sub_category: 'paper', weightKg: weight });
      expect(result).toBe(weight * EMISSION_FACTORS.waste.paper);
    });
  });

  describe('computeEmissionsForCategory integration wrapper', () => {
    test('should correctly orchestrate transport flight calculations', () => {
      const result = computeEmissionsForCategory('transport', 'flight', { flightHours: 4 });
      expect(result.co2_emission).toBe(4 * EMISSION_FACTORS.transport.flight);
    });

    test('should correctly orchestrate electricity energy calculations', () => {
      const result = computeEmissionsForCategory('energy', 'electricity', { kwh: 100 });
      expect(result.co2_emission).toBe(100 * EMISSION_FACTORS.energy.electricity);
    });
  });
});
