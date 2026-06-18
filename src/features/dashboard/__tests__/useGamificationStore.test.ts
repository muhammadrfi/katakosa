/// <reference types="vitest/globals" />
import { useGamificationStore } from '../useGamificationStore';
import { beforeEach, describe, it, expect, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useGamificationStore', () => {
  beforeEach(() => {
    useGamificationStore.getState().resetGamification();
  });

  it('should initialize with default values', () => {
    const state = useGamificationStore.getState();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.badges).toEqual([]);
    expect(state.streak).toBe(0);
    expect(state.lastActiveDate).toBeNull();
  });

  it('should add XP correctly', () => {
    useGamificationStore.getState().addXp(50);
    const state = useGamificationStore.getState();
    expect(state.xp).toBe(50);
    expect(state.level).toBe(1);
  });

  it('should trigger level up when exceeding threshold', () => {
    // Level 1: needs 100 XP to level up to 2
    useGamificationStore.getState().addXp(120);
    const state = useGamificationStore.getState();
    expect(state.level).toBe(2);
    expect(state.xp).toBe(20); // 120 - 100
  });

  it('should handle multiple level ups correctly', () => {
    // Level 1 needs 100 XP. Level 2 needs 200 XP. Total = 300 XP to reach Level 3.
    useGamificationStore.getState().addXp(350);
    const state = useGamificationStore.getState();
    expect(state.level).toBe(3);
    expect(state.xp).toBe(50); // 350 - 100 - 200
  });

  it('should unlock badges correctly', () => {
    useGamificationStore.getState().unlockBadge('first_step');
    const state = useGamificationStore.getState();
    expect(state.badges).toContain('first_step');
    expect(state.badges.length).toBe(1);
  });

  it('should not unlock duplicate badges', () => {
    useGamificationStore.getState().unlockBadge('first_step');
    useGamificationStore.getState().unlockBadge('first_step');
    const state = useGamificationStore.getState();
    expect(state.badges).toEqual(['first_step']);
  });

  it('should track daily activities and update XP/logs', () => {
    const today = new Date().toISOString().split('T')[0];
    useGamificationStore.getState().addActivity(2);
    
    const state = useGamificationStore.getState();
    expect(state.historyLogs[today]).toBe(2);
    expect(state.streak).toBe(1);
    expect(state.lastActiveDate).toBe(today);
    // 2 activities * 5 XP = 10 XP
    expect(state.xp).toBe(10);
  });
});
