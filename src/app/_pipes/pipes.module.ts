import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatchOrderPipe } from './match-order.pipe';
import { FilterAlumniPipe } from './filter-alumni.pipe';
import { RelativeTimePipe } from './relativeTime.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  declarations: [MatchOrderPipe, FilterAlumniPipe, RelativeTimePipe, SafeHtmlPipe],
  imports: [CommonModule],
  exports: [MatchOrderPipe, FilterAlumniPipe, RelativeTimePipe, SafeHtmlPipe],
  providers: [MatchOrderPipe, DatePipe]
})
export class PipesModule {}
