import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';

import { AppConfigComponent } from './app.config.component';

@NgModule({
    declarations: [AppConfigComponent],
    imports: [CommonModule, FormsModule, SidebarModule],
    exports: [AppConfigComponent],
})
export class AppConfigModule { }
