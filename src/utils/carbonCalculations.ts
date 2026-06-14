// Realistic Emission Factors (in kg CO2e per unit)
// References: EPA (Environmental Protection Agency) and IPCC guidelines

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192,  // kg CO2e per km
    car_diesel: 0.171,  // kg CO2e per km
    car_electric: 0.047, // kg CO2e per km (electric grid average contribution)
    bike: 0.0,          // zero direct emissions
    bus: 0.089,         // kg CO2e per passenger km
    train: 0.041,       // kg CO2e per passenger km
    flight: 90.0,       // kg CO2e per flight hour (roughly ~150-250g per passenger-km depending on short/long haul, 90kg per hour is standard average)
  },
  energy: {
    electricity: 0.475, // kg CO2e per kWh (typical grid average)
    lpg: 2.93,          // kg CO2e per kg of LPG (liquefied petroleum gas)
  },
  food: {
    vegetarian: 1.7,    // kg CO2e per day
    mixed: 2.5,         // kg CO2e per day
    non_vegetarian: 4.8 // kg CO2e per day (meat-heavy diet)
  },
  waste: {
    plastic: 1.89,      // kg CO2e per kg (production + waste treatment impact)
    paper: 0.52,        // kg CO2e per kg
    organic: 0.28       // kg CO2e per kg (anaerobic decomposition impact)
  }
};

export interface TransportCalculationInput {
  sub_category: 'car' | 'bike' | 'bus' | 'train' | 'flight';
  distanceKm?: number;
  flightHours?: number;
  fuelType?: 'petrol' | 'diesel' | 'electric';
}

export interface EnergyCalculationInput {
  sub_category: 'electricity' | 'lpg';
  kwh?: number;
  lpgKg?: number;
}

export interface FoodCalculationInput {
  sub_category: 'vegetarian' | 'mixed' | 'non_vegetarian';
  days?: number;
}

export interface WasteCalculationInput {
  sub_category: 'plastic' | 'paper' | 'organic';
  weightKg?: number;
}

// Main Calculator Functions
export const calculateTransportEmissions = (input: TransportCalculationInput): number => {
  const { sub_category, distanceKm = 0, flightHours = 0, fuelType = 'petrol' } = input;
  
  if (sub_category === 'car') {
    const factor = EMISSION_FACTORS.transport[`car_${fuelType}` as keyof typeof EMISSION_FACTORS.transport.car_petrol] || EMISSION_FACTORS.transport.car_petrol;
    return distanceKm * factor;
  }
  
  if (sub_category === 'flight') {
    return flightHours * EMISSION_FACTORS.transport.flight;
  }
  
  const factor = EMISSION_FACTORS.transport[sub_category as keyof typeof EMISSION_FACTORS.transport] || 0;
  return distanceKm * factor;
};

export const calculateEnergyEmissions = (input: EnergyCalculationInput): number => {
  const { sub_category, kwh = 0, lpgKg = 0 } = input;
  
  if (sub_category === 'electricity') {
    return kwh * EMISSION_FACTORS.energy.electricity;
  }
  
  if (sub_category === 'lpg') {
    return lpgKg * EMISSION_FACTORS.energy.lpg;
  }
  
  return 0;
};

export const calculateFoodEmissions = (input: FoodCalculationInput): number => {
  const { sub_category, days = 1 } = input;
  const factor = EMISSION_FACTORS.food[sub_category] || EMISSION_FACTORS.food.mixed;
  return days * factor;
};

export const calculateWasteEmissions = (input: WasteCalculationInput): number => {
  const { sub_category, weightKg = 0 } = input;
  const factor = EMISSION_FACTORS.waste[sub_category] || 0;
  return weightKg * factor;
};

// Form values to entry utility
export const computeEmissionsForCategory = (
  category: 'transport' | 'energy' | 'food' | 'waste',
  subCategory: string,
  values: any
): { value: number; co2_emission: number } => {
  let value = 0;
  let co2_emission = 0;

  switch (category) {
    case 'transport':
      if (subCategory === 'flight') {
        value = Number(values.flightHours || 0);
        co2_emission = calculateTransportEmissions({ sub_category: 'flight', flightHours: value });
      } else {
        value = Number(values.distanceKm || 0);
        co2_emission = calculateTransportEmissions({
          sub_category: subCategory as any,
          distanceKm: value,
          fuelType: values.fuelType
        });
      }
      break;
    
    case 'energy':
      if (subCategory === 'electricity') {
        value = Number(values.kwh || 0);
        co2_emission = calculateEnergyEmissions({ sub_category: 'electricity', kwh: value });
      } else {
        value = Number(values.lpgKg || 0);
        co2_emission = calculateEnergyEmissions({ sub_category: 'lpg', lpgKg: value });
      }
      break;
      
    case 'food':
      value = Number(values.days || 1);
      co2_emission = calculateFoodEmissions({ sub_category: subCategory as any, days: value });
      break;
      
    case 'waste':
      value = Number(values.weightKg || 0);
      co2_emission = calculateWasteEmissions({ sub_category: subCategory as any, weightKg: value });
      break;
  }

  // Round to 2 decimal places
  return {
    value,
    co2_emission: Math.round(co2_emission * 100) / 100
  };
};
