'use client';

import React, { useState, useEffect } from 'react';
import NavigationShell from '../../components/NavigationShell';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../lib/db';
import { FootprintEntry, CarbonCategory } from '../../types';
import { computeEmissionsForCategory, EMISSION_FACTORS } from '../../utils/carbonCalculations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Car, 
  Flame, 
  Apple, 
  Trash2, 
  History, 
  Check, 
  Trash, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn, formatNumber, formatDate } from '../../lib/utils';

// Unified Zod schema for inputs
const calculatorSchema = zod.object({
  category: zod.enum(['transport', 'energy', 'food', 'waste']),
  sub_category: zod.string().min(1, 'Please select a sub-category'),
  distanceKm: zod.coerce.number().nonnegative().optional(),
  flightHours: zod.coerce.number().nonnegative().optional(),
  fuelType: zod.enum(['petrol', 'diesel', 'electric']).default('petrol'),
  kwh: zod.coerce.number().nonnegative().optional(),
  lpgKg: zod.coerce.number().nonnegative().optional(),
  days: zod.coerce.number().int().min(1).max(365).default(1).optional(),
  weightKg: zod.coerce.number().nonnegative().optional(),
  recorded_date: zod.string().min(1, 'Please select a date'),
});

type CalculatorFormValues = zod.infer<typeof calculatorSchema>;

export default function CalculatorPage() {
  const { user, refreshProfile } = useAuth();
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form setup
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      category: 'transport',
      sub_category: 'car',
      fuelType: 'petrol',
      days: 1,
      recorded_date: new Date().toISOString().split('T')[0]
    }
  });

  // Watch form fields for live CO2 calculation
  const watchedCategory = watch('category');
  const watchedSubCategory = watch('sub_category');
  const watchedDistanceKm = watch('distanceKm');
  const watchedFlightHours = watch('flightHours');
  const watchedFuelType = watch('fuelType');
  const watchedKwh = watch('kwh');
  const watchedLpgKg = watch('lpgKg');
  const watchedDays = watch('days');
  const watchedWeightKg = watch('weightKg');

  // Compute live estimate based on watched values
  const [liveEstimate, setLiveEstimate] = useState<number>(0);

  useEffect(() => {
    const computed = computeEmissionsForCategory(watchedCategory, watchedSubCategory, {
      distanceKm: watchedDistanceKm,
      flightHours: watchedFlightHours,
      fuelType: watchedFuelType,
      kwh: watchedKwh,
      lpgKg: watchedLpgKg,
      days: watchedDays,
      weightKg: watchedWeightKg
    });
    setLiveEstimate(computed.co2_emission);
  }, [
    watchedCategory, 
    watchedSubCategory, 
    watchedDistanceKm, 
    watchedFlightHours, 
    watchedFuelType, 
    watchedKwh, 
    watchedLpgKg, 
    watchedDays, 
    watchedWeightKg
  ]);

  // Handle category switch
  const handleCategorySwitch = (category: CarbonCategory) => {
    setValue('category', category);
    setErrorMessage(null);
    if (category === 'transport') {
      setValue('sub_category', 'car');
    } else if (category === 'energy') {
      setValue('sub_category', 'electricity');
    } else if (category === 'food') {
      setValue('sub_category', 'mixed');
    } else if (category === 'waste') {
      setValue('sub_category', 'plastic');
    }
  };

  // Fetch entries
  const fetchEntries = async () => {
    if (!user) return;
    try {
      const data = await dbService.getFootprintEntries(user.id);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load footprint entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  // Handle submit log
  const onSubmit = async (data: CalculatorFormValues) => {
    if (!user) return;
    setErrorMessage(null);
    try {
      const { value, co2_emission } = computeEmissionsForCategory(data.category, data.sub_category, {
        distanceKm: data.distanceKm,
        flightHours: data.flightHours,
        fuelType: data.fuelType,
        kwh: data.kwh,
        lpgKg: data.lpgKg,
        days: data.days,
        weightKg: data.weightKg
      });

      const meta: Record<string, any> = {};
      if (data.category === 'transport' && data.sub_category === 'car') {
        meta.fuelType = data.fuelType;
      }

      await dbService.addFootprintEntry({
        user_id: user.id,
        category: data.category,
        sub_category: data.sub_category,
        recorded_date: data.recorded_date,
        value,
        co2_emission,
        metadata: meta
      });

      setSaveSuccess(true);
      reset({
        category: data.category,
        sub_category: data.sub_category,
        fuelType: data.fuelType,
        days: 1,
        recorded_date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh profile to update Green Points dynamically
      await refreshProfile();
      await fetchEntries();

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save footprint entry');
    }
  };

  // Handle delete
  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    try {
      await dbService.deleteFootprintEntry(id, user.id);
      await fetchEntries();
      await refreshProfile(); // points might change
    } catch (err) {
      console.error('Failed to delete footprint entry:', err);
    }
  };

  const getCategoryIcon = (cat: CarbonCategory) => {
    switch (cat) {
      case 'transport': return <Car className="w-4 h-4 text-sky-400" />;
      case 'energy': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'food': return <Apple className="w-4 h-4 text-emerald-400" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <NavigationShell>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Carbon Calculator</h1>
          <p className="text-slate-400 text-sm">Log your daily activities and calculate their carbon emissions instantly.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Log Entry Panel */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-6">
              {/* Category selector pills */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-3">
                  Select Activity Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'transport', label: 'Transport', icon: Car, color: 'hover:border-sky-500/30' },
                    { id: 'energy', label: 'Energy', icon: Flame, color: 'hover:border-amber-500/30' },
                    { id: 'food', label: 'Food & Diet', icon: Apple, color: 'hover:border-emerald-500/30' },
                    { id: 'waste', label: 'Waste', icon: Trash2, color: 'hover:border-rose-500/30' },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = watchedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySwitch(cat.id as CarbonCategory)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center font-bold text-xs transition-all",
                          isSelected 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                            : "border-white/5 bg-white/5 text-slate-400 hover:text-white",
                          cat.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* TRANSPORT SUB-FORM */}
                {watchedCategory === 'transport' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Transportation Mode</label>
                      <select 
                        className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                        {...register('sub_category')}
                      >
                        <option value="car">Personal Car</option>
                        <option value="bike">Bicycle / Electric Scooter</option>
                        <option value="bus">Public Bus</option>
                        <option value="train">Train / Metro</option>
                        <option value="flight">Aviation Flight</option>
                      </select>
                    </div>

                    {watchedSubCategory === 'car' && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Car Fuel Type</label>
                          <select 
                            className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                            {...register('fuelType')}
                          >
                            <option value="petrol">Petrol / Gasoline</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric Vehicle (EV)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Distance Driven (km)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 25"
                            className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                            {...register('distanceKm')}
                          />
                          {errors.distanceKm && <span className="text-rose-400 text-[10px]">{errors.distanceKm.message}</span>}
                        </div>
                      </div>
                    )}

                    {watchedSubCategory !== 'car' && watchedSubCategory !== 'flight' && (
                      <div className="flex flex-col gap-1.5 animate-fade-in">
                        <label className="text-xs font-semibold text-slate-300">Distance Traveled (km)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 15"
                          className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                          {...register('distanceKm')}
                        />
                        {errors.distanceKm && <span className="text-rose-400 text-[10px]">{errors.distanceKm.message}</span>}
                      </div>
                    )}

                    {watchedSubCategory === 'flight' && (
                      <div className="flex flex-col gap-1.5 animate-fade-in">
                        <label className="text-xs font-semibold text-slate-300">Flight Duration (hours)</label>
                        <input 
                          type="number" 
                          step="0.5"
                          placeholder="e.g. 2.5"
                          className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                          {...register('flightHours')}
                        />
                        {errors.flightHours && <span className="text-rose-400 text-[10px]">{errors.flightHours.message}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* ENERGY SUB-FORM */}
                {watchedCategory === 'energy' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Energy Source</label>
                      <select 
                        className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                        {...register('sub_category')}
                      >
                        <option value="electricity">Utility Electricity</option>
                        <option value="lpg">LPG Cooking Gas</option>
                      </select>
                    </div>

                    {watchedSubCategory === 'electricity' ? (
                      <div className="flex flex-col gap-1.5 animate-fade-in">
                        <label className="text-xs font-semibold text-slate-300">Electricity Consumed (kWh)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 150"
                          className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                          {...register('kwh')}
                        />
                        {errors.kwh && <span className="text-rose-400 text-[10px]">{errors.kwh.message}</span>}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 animate-fade-in">
                        <label className="text-xs font-semibold text-slate-300">LPG Cylinder weight / usage (kg)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 14.2"
                          className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                          {...register('lpgKg')}
                        />
                        {errors.lpgKg && <span className="text-rose-400 text-[10px]">{errors.lpgKg.message}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* FOOD SUB-FORM */}
                {watchedCategory === 'food' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Diet Type</label>
                      <select 
                        className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                        {...register('sub_category')}
                      >
                        <option value="vegetarian">Vegetarian (No meat, has dairy)</option>
                        <option value="mixed">Mixed Diet (Balanced meat, veg)</option>
                        <option value="non_vegetarian">Non-Vegetarian (Meat-heavy, high impact)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 animate-fade-in">
                      <label className="text-xs font-semibold text-slate-300">Log Period (days)</label>
                      <input 
                        type="number" 
                        min="1"
                        max="30"
                        className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                        {...register('days')}
                      />
                      {errors.days && <span className="text-rose-400 text-[10px]">{errors.days.message}</span>}
                    </div>
                  </div>
                )}

                {/* WASTE SUB-FORM */}
                {watchedCategory === 'waste' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Waste Material Type</label>
                      <select 
                        className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                        {...register('sub_category')}
                      >
                        <option value="plastic">Single-use Plastics</option>
                        <option value="paper">Paper & Cardboard</option>
                        <option value="organic">Organic / Food Waste</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 animate-fade-in">
                      <label className="text-xs font-semibold text-slate-300">Estimated Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g. 2.4"
                        className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                        {...register('weightKg')}
                      />
                      {errors.weightKg && <span className="text-rose-400 text-[10px]">{errors.weightKg.message}</span>}
                    </div>
                  </div>
                )}

                {/* Common fields (Date) */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date of Activity
                  </label>
                  <input 
                    type="date" 
                    className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                    {...register('recorded_date')}
                  />
                  {errors.recorded_date && <span className="text-rose-400 text-[10px]">{errors.recorded_date.message}</span>}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={cn(
                    "w-full py-3.5 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-emerald-500 flex items-center justify-center gap-2",
                    saveSuccess 
                      ? "bg-emerald-600 text-white" 
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  )}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      Activity Logged (+10 points!)
                    </>
                  ) : (
                    'Log Activity & Add Points'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Side Estimate & Calculation Info */}
          <div className="flex flex-col gap-6">
            {/* Live Estimate Card */}
            <div className="p-6 rounded-2xl bg-[#10121a] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center">
              {/* Background gradient grid */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <Info className="w-5 h-5 text-emerald-400 mb-3 absolute top-4 right-4" />
              
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Impact</span>
              
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-1.5 flex items-baseline justify-center gap-1">
                {formatNumber(liveEstimate)}
                <span className="text-sm font-semibold text-slate-500">kg</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 mb-4 bg-emerald-500/10 px-2 py-0.5 rounded-full">CO2e Emissions</span>
              
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px]">
                {liveEstimate > 100 
                  ? "This activity has a high carbon footprint. Consider offsets or eco alternatives." 
                  : liveEstimate > 10 
                  ? "This activity represents moderate daily impact. Logging it helps track monthly patterns." 
                  : liveEstimate > 0 
                  ? "Outstanding! This is a very clean activity. Keep up the low-impact habits."
                  : "Enter values above to calculate live emissions."}
              </p>
            </div>

            {/* EPA Equivalency card */}
            {liveEstimate > 0 && (
              <div className="p-5 rounded-2xl glass-panel border border-white/5 animate-fade-in flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">EPA Equivalency context</h4>
                <div className="flex flex-col gap-2.5 text-xs text-slate-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Smartphones Charged:</span>
                    <strong className="text-white">{(liveEstimate * 122).toFixed(0)} phones</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Gallons of Gasoline:</span>
                    <strong className="text-white">{(liveEstimate * 0.113).toFixed(2)} gal</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tree seedlings grown:</span>
                    <strong className="text-white">{(liveEstimate * 0.016).toFixed(3)} trees</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Coefficients Panel */}
            <div className="p-5 rounded-2xl glass-panel border border-white/5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Emission coefficients</h4>
              <div className="flex flex-col gap-2.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Car Petrol:</span>
                  <span className="font-bold text-slate-300">0.19 kg / km</span>
                </div>
                <div className="flex justify-between">
                  <span>Car EV Grid:</span>
                  <span className="font-bold text-slate-300">0.05 kg / km</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity:</span>
                  <span className="font-bold text-slate-300">0.47 kg / kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Veg Diet:</span>
                  <span className="font-bold text-slate-300">4.80 kg / day</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs History */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Recent Activity Log</h2>
          </div>

          {loadingEntries ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-t border-emerald-500 mx-auto mb-2" />
              Loading carbon records...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm italic">
              No activity logs recorded yet. Begin by adding transportation, energy, or dietary habits.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Logged Value</th>
                    <th className="py-3 px-4 text-emerald-400">Carbon Impact</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 px-4 font-semibold text-slate-300 whitespace-nowrap">
                        {formatDate(entry.recorded_date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        {getCategoryIcon(entry.category)}
                        <span className="capitalize">{entry.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 capitalize">
                        {entry.sub_category.replace('_', ' ')}
                        {entry.metadata?.fuelType && <span className="text-[10px] text-slate-600 ml-1">({entry.metadata.fuelType})</span>}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-300">
                        {formatNumber(entry.value)}{' '}
                        <span className="text-slate-500 font-normal">
                          {entry.category === 'transport' 
                            ? (entry.sub_category === 'flight' ? 'hours' : 'km') 
                            : entry.category === 'energy' 
                            ? (entry.sub_category === 'electricity' ? 'kWh' : 'kg') 
                            : entry.category === 'food' 
                            ? 'days' 
                            : 'kg'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                        {formatNumber(entry.co2_emission)} kg CO2e
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors focus:outline-none"
                          title="Delete entry"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NavigationShell>
  );
}
