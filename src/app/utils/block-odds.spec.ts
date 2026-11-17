import {
    blockRate, chanceWithin, expectedSeconds, formatDuration, formatOneIn, formatPercent,
    HASHES_PER_DIFFICULTY, SECONDS_PER_BLOCK, SECONDS_PER_DAY, SECONDS_PER_YEAR
} from './block-odds';

describe('block odds', () => {
    // Mainnet on 2026-11-17 and the two miners' combined hashrate.
    const difficulty = 134823837323272.7;
    const hashRate = 1.6e12;

    it('finds one block per 600 s on average at the network share of one block per 600 s', () => {
        const h = (difficulty * HASHES_PER_DIFFICULTY) / SECONDS_PER_BLOCK;
        expect(blockRate(h, difficulty)).toBeCloseTo(1 / 600, 12);
        expect(expectedSeconds(h, difficulty)).toBeCloseTo(600, 6);
        expect(chanceWithin(h, difficulty, 600)).toBeCloseTo(1 - Math.exp(-1), 12);
    });

    it('keeps precision for tiny chances', () => {
        const perBlock = chanceWithin(hashRate, difficulty, SECONDS_PER_BLOCK);
        expect(perBlock).toBeCloseTo(1.658e-9, 12);
        expect(perBlock / (hashRate * 600 / (difficulty * HASHES_PER_DIFFICULTY))).toBeCloseTo(1, 6);
    });

    it('matches the expected daily and yearly odds', () => {
        expect(chanceWithin(hashRate, difficulty, SECONDS_PER_DAY)).toBeCloseTo(2.386e-7, 9);
        expect(chanceWithin(hashRate, difficulty, SECONDS_PER_YEAR)).toBeCloseTo(8.71e-5, 7);
        expect(expectedSeconds(hashRate, difficulty) / SECONDS_PER_YEAR).toBeCloseTo(11476, -1);
    });

    it('returns zero odds for no hashrate or no difficulty', () => {
        expect(chanceWithin(0, difficulty, SECONDS_PER_DAY)).toBe(0);
        expect(chanceWithin(hashRate, 0, SECONDS_PER_DAY)).toBe(0);
        expect(chanceWithin(NaN, difficulty, SECONDS_PER_DAY)).toBe(0);
        expect(expectedSeconds(0, difficulty)).toBe(Infinity);
    });

    it('formats percentages', () => {
        expect(formatPercent(0)).toBe('0%');
        expect(formatPercent(0.5)).toBe('50.00%');
        expect(formatPercent(8.71e-5)).toBe('0.0087%');
        expect(formatPercent(2.386e-7)).toBe('0.000024%');
        expect(formatPercent(1.657e-9)).toBe('1.7e-7%');
    });

    it('formats "1 in N"', () => {
        expect(formatOneIn(0)).toBe('1 in ∞');
        expect(formatOneIn(0.5)).toBe('1 in 2.0');
        expect(formatOneIn(1 / 11476)).toBe('1 in 11.5K');
        expect(formatOneIn(2.386e-7)).toBe('1 in 4.2M');
        expect(formatOneIn(chanceWithin(hashRate, difficulty, SECONDS_PER_BLOCK))).toBe('1 in 603M');
    });

    it('formats durations', () => {
        expect(formatDuration(Infinity)).toBe('∞');
        expect(formatDuration(11476 * SECONDS_PER_YEAR)).toBe('11,476 years');
        expect(formatDuration(3.2 * SECONDS_PER_DAY)).toBe('3.2 days');
        expect(formatDuration(30)).toBe('30 seconds');
    });
});
