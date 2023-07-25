import { NgModule } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepsModule } from 'primeng/steps';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';




export const primeNgServices = [
    MessageService,
    ConfirmationService
]

const primeNgModules = [
    ButtonModule,
    DropdownModule,
    ToastModule,
    CheckboxModule,
    CardModule,
    DialogModule,
    StepsModule,
    InputTextModule,
    DividerModule,
    ProgressSpinnerModule,
    DynamicDialogModule,
    FieldsetModule,
    CalendarModule,
    InputTextareaModule,
    TableModule,
    InputNumberModule,
    ConfirmDialogModule,
    TabViewModule,
    MenuModule,
    OverlayPanelModule,
    DataViewModule,
    ChartModule,
    TagModule,
    StyleClassModule,
    PanelModule,
    SelectButtonModule
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