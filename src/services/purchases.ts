import { useApp } from '@/store/app';
import { track } from './analytics';

export type PlanId = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  /** Localised price string from the store, e.g. "$4.99". Null when prices are unknown. */
  price: string | null;
}

export interface Purchases {
  /** False when no real store is connected and purchases only flip a local test flag. */
  readonly live: boolean;
  getPlans(): Promise<Plan[]>;
  purchase(plan: PlanId): Promise<boolean>;
  restore(): Promise<boolean>;
}

/**
 * Demo implementation used until RevenueCat is wired in (see docs/SETUP.md, step 5).
 * It unlocks Pro on this device only. The scan endpoint still checks the entitlement
 * on the server, so this flag cannot be used to get free scans in production.
 */
const demoPurchases: Purchases = {
  live: false,
  async getPlans() {
    return [
      { id: 'monthly', price: null },
      { id: 'yearly', price: null },
    ];
  },
  async purchase(plan) {
    useApp.getState().setPro(true);
    track('purchase_completed', { plan, demo: true });
    return true;
  },
  async restore() {
    return useApp.getState().isPro;
  },
};

export const purchases: Purchases = demoPurchases;
