import { describe, expect, it } from 'vitest';
import { chartDay, chartHours, chartSummary } from './popular-times-chart';

describe('popular times chart', () => {
  it('selects today in the venue timezone across a date boundary', () => {
    expect(chartDay('America/Los_Angeles', new Date('2026-10-06T01:00:00Z'))).toBe('monday');
  });
  it('does not invent a local day when the timezone is missing or invalid', () => {
    expect(chartDay(null)).toBeNull();
    expect(chartDay('invalid')).toBeNull();
  });
  it('keeps missing hours distinct from measured zero activity', () => {
    const hours = chartHours([{ hour: 9, busyness: 0 }, { hour: 13, busyness: 80 }]);
    expect(hours).toHaveLength(24);
    expect(hours[8].busyness).toBeNull();
    expect(hours[9].busyness).toBe(0);
    expect(chartSummary('monday', hours)).toBe('Monday: busiest around 13:00, 80% typical activity. 22 hours have no data.');
  });
  it('summarizes empty days without implying a quiet venue', () => {
    expect(chartSummary('tuesday', chartHours(undefined))).toBe('Tuesday: no popular-times data for this day.');
  });
  it('summarizes a complete day without a missing-data warning', () => {
    const hours = chartHours(Array.from({ length: 24 }, (_, hour) => ({ hour, busyness: 0 })));
    expect(chartSummary('sunday', hours)).toBe('Sunday: reported typical activity is 0% throughout the available hours.');
  });
});
