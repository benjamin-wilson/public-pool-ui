import { NgModule } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

export const primeNgServices = [
    MessageService,
    ConfirmationService
]

const primeNgModules = [
    TableModule,
    ChartModule,
    InputSwitchModule,
    ButtonModule,
    TooltipModule
    // DropdownModule,
    // ToastModule,
    // CheckboxModule,
    // CardModule,
    // DialogModule,
    // StepsModule,
    // InputTextModule,
    // DividerModule,
    // ProgressSpinnerModule,
    // DynamicDialogModule,
    // FieldsetModule,
    // InputTextareaModule,

    // InputNumberModule,
    // ConfirmDialogModule,
    // TabViewModule,
    // MenuModule,
    // OverlayPanelModule,
    // DataViewModule,

    // TagModule,
    // StyleClassModule,
    // PanelModule,
    // SelectButtonModule,

];


@NgModule({
    providers: [
        ...primeNgServices
    ],
    imports: [
        ...primeNgModules
    ],
    exports: [
        ...primeNgModules
    ],
})
export class PrimeNGModule { }