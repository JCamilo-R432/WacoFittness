import { calculateRecoveryScore, recommendSleepHours, detectDeloadWeek, calculateOptimalBedtime } from '../src/utils/recovery.utils';

describe('Recovery Utils', () => {

    it('calculates proper recovery score based on components', () => {
        // 8 hr sleep = 40 pts, quality 5 = 20 pts, stress 1 = 20 pts, intensity 0 = 20 pts -> 100
        const perfectScore = calculateRecoveryScore(8, 5, 1, 0);
        expect(perfectScore).toBe(100);

        // 4 hr = 20pts, q 2.5 = 10pts, stress 10 = 0pts, intensity 10 = 10pts -> 40
        const badScore = calculateRecoveryScore(4, 2.5, 10, 10);
        expect(badScore).toBe(40);
    });

    it('recommends sleep hours accordingly', () => {
        expect(recommendSleepHours(16, 'ligero')).toBe(9); // 16yo -> base 9
        expect(recommendSleepHours(25, 'sedentario')).toBe(8); // Adult base 8
        expect(recommendSleepHours(25, 'activo')).toBe(9); // Active adult
    });

    it('detects a deload week needed', () => {
        expect(detectDeloadWeek(8, 1)).toBe(true);
        expect(detectDeloadWeek(4, 5)).toBe(true);
        expect(detectDeloadWeek(3, 2)).toBe(false);
    });

    it('calculates optimal bedtime based on cycles', () => {
        const wake = new Date('2025-01-01T07:00:00.000Z');
        const bedtime = calculateOptimalBedtime(wake, 8);
        // 8 horas atrás deberia ser 23:00 del día anterior
        expect(bedtime.toISOString()).toBe('2024-12-31T23:00:00.000Z');
    });

});
