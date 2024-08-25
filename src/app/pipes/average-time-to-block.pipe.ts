import { Pipe, PipeTransform } from '@angular/core';
import { DateAgoPipe } from './date-ago.pipe';

@Pipe({
  name: 'averageTimeToBlock',
  standalone: true
})
export class AverageTimeToBlockPipe implements PipeTransform {

  private static _this = new AverageTimeToBlockPipe();
  private static _dateAgo = new DateAgoPipe();

  public static transform(value: number, difficulty: number): string {
    return this._this.transform(value, difficulty);
  }

  public transform(value: number, difficulty: number): string {
    const blockTimeInSeconds = this.calculateBlockTime(value, difficulty);
    if(blockTimeInSeconds > 8000000000000){
      return '~∞';
    }
    const date = new Date(new Date().getTime() + (blockTimeInSeconds * 1000));
    return AverageTimeToBlockPipe._dateAgo.transform(date);
  }

  private calculateBlockTime(hashRate: number, difficulty: number): number {
    const hashesPerDifficulty = Math.pow(2, 32);

    // Calculate the average block time in seconds
    const averageBlockTime = (difficulty * hashesPerDifficulty) / hashRate;

    return averageBlockTime;
  }
}
