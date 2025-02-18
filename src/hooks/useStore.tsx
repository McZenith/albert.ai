import {create} from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  matchId: string;
  marketId: string;
  addedAt: string;
  teams: {
    home: { id: string; name: string; };
    away: { id: string; name: string; };
  };
  market: {
    description: string;
    profitPercentage: number;
    outcomes: Array<{
      description: string;
      odds: number;
      stakePercentage: number;
    }>;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (matchId: string, marketId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, addedAt: new Date().toISOString() }]
      })),
      removeItem: (matchId, marketId) => set((state) => ({
        items: state.items.filter(
          item => !(item.matchId === matchId && item.marketId === marketId)
        )
      })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'arbitrage-cart'
    }
  )
);