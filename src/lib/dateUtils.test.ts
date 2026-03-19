import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLocalDateString, getNextMidnight, isValidPostDate } from './dateUtils';

describe('dateUtils 測試 - 模擬系統時間', () => {
  beforeEach(() => {
    // 啟用模擬計時器
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 恢復真實計時器
    vi.useRealTimers();
  });

  it('應在今天 23:59 分時返回正確的日期字串', () => {
    const mockDate = new Date('2026-03-19T23:59:59');
    vi.setSystemTime(mockDate);
    
    expect(getLocalDateString()).toBe('2026-03-19');
  });

  it('應在過了一秒轉為明天時返回新日期', () => {
    const mockDate = new Date('2026-03-19T23:59:59');
    vi.setSystemTime(mockDate);
    
    // 模擬快轉 1 秒
    vi.advanceTimersByTime(1000);
    
    expect(getLocalDateString()).toBe('2026-03-20');
  });

  it('應正確計算跨月的午夜 0 點', () => {
    const mockDate = new Date('2026-02-28T12:00:00');
    vi.setSystemTime(mockDate);
    
    const nextMidnight = getNextMidnight();
    expect(getLocalDateString(nextMidnight)).toBe('2026-03-01');
    expect(nextMidnight.getHours()).toBe(0);
  });

  describe('isValidPostDate 驗證邏輯', () => {
    const serverDate = '2026-03-19';

    it('應接受當天日期', () => {
      expect(isValidPostDate('2026-03-19', serverDate)).toBe(true);
    });

    it('應接受前後一天的日期 (時區緩衝)', () => {
      expect(isValidPostDate('2026-03-18', serverDate)).toBe(true);
      expect(isValidPostDate('2026-03-20', serverDate)).toBe(true);
    });

    it('應拒絕超過 24 小時的過期日期', () => {
      expect(isValidPostDate('2026-03-17', serverDate)).toBe(false);
      expect(isValidPostDate('2020-01-01', serverDate)).toBe(false);
    });

    it('應拒絕超過 24 小時的未來日期', () => {
      expect(isValidPostDate('2026-03-21', serverDate)).toBe(false);
      expect(isValidPostDate('2099-12-31', serverDate)).toBe(false);
    });
  });
});

/**
 * 如何運行測試：
 * 1. 安裝 Vitest: npm install -D vitest
 * 2. 執行指令: npx vitest run src/lib/dateUtils.test.ts
 */
