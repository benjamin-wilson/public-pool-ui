// Solo mining is a Poisson process: each hash wins with probability
// 1 / (difficulty * 2^32), so a miner hashing at H finds blocks at rate
// lambda = H / (difficulty * 2^32) per second.
export const HASHES_PER_DIFFICULTY = Math.pow(2, 32);

export const SECONDS_PER_BLOCK = 600;
export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

export function blockRate(hashRate: number, difficulty: number): number {
    if (!(hashRate > 0) || !(difficulty > 0)) {
        return 0;
    }
    return hashRate / (difficulty * HASHES_PER_DIFFICULTY);
}

// Chance of finding at least one block within `seconds`: 1 - e^(-lambda * t).
// expm1 keeps precision when the chance is tiny (1e-9 and below).
export function chanceWithin(hashRate: number, difficulty: number, seconds: number): number {
    return -Math.expm1(-blockRate(hashRate, difficulty) * seconds);
}

export function expectedSeconds(hashRate: number, difficulty: number): number {
    const rate = blockRate(hashRate, difficulty);
    return rate > 0 ? 1 / rate : Infinity;
}

// "0.0087%" style, with enough significant digits to be readable at any size.
export function formatPercent(chance: number): string {
    if (!(chance > 0)) {
        return '0%';
    }
    const percent = chance * 100;
    if (percent >= 1) {
        return percent.toFixed(2) + '%';
    }
    return percent.toPrecision(2).replace(/\.?0+e/, 'e') + '%';
}

// "1 in 4.2M" style.
export function formatOneIn(chance: number): string {
    if (!(chance > 0)) {
        return '1 in ∞';
    }
    const n = 1 / chance;
    if (n < 10) {
        return '1 in ' + n.toFixed(1);
    }
    const units: [number, string][] = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e4, 'K']];
    for (const [size, suffix] of units) {
        if (n >= size) {
            const value = n / (suffix === 'K' ? 1e3 : size);
            return '1 in ' + value.toFixed(value >= 100 ? 0 : 1) + suffix;
        }
    }
    return '1 in ' + Math.round(n).toLocaleString('en-US');
}

// "11,500 years" / "3.2 days" style.
export function formatDuration(seconds: number): string {
    if (!isFinite(seconds)) {
        return '∞';
    }
    const units: [number, string][] = [[SECONDS_PER_YEAR, 'year'], [SECONDS_PER_DAY, 'day'], [3600, 'hour'], [60, 'minute']];
    for (const [size, name] of units) {
        if (seconds >= size) {
            const value = seconds / size;
            const text = value >= 100 ? Math.round(value).toLocaleString('en-US') : value.toFixed(1);
            return `${text} ${name}s`;
        }
    }
    return `${Math.round(seconds)} seconds`;
}
