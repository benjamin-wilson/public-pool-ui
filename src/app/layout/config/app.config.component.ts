import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LayoutService } from '../service/app.layout.service';
import { THEME_FAMILIES, THEMES, ThemeMode, ThemeOption } from './theme-catalog';

interface ThemeGroup {
    family: string;
    themes: ThemeOption[];
}

@Component({
    selector: 'app-config',
    templateUrl: './app.config.component.html',
    styleUrls: ['./app.config.component.scss'],
})
export class AppConfigComponent implements OnDestroy {

    /** Own field, so PrimeNG's two-way `visible` binding has something to write to. */
    public visible = false;

    private readonly openSubscription: Subscription;

    /** Which half of the catalog is showing; follows the active theme on open. */
    public mode: ThemeMode;

    constructor(public layoutService: LayoutService) {
        this.mode = this.layoutService.config.colorScheme === 'light' ? 'light' : 'dark';
        this.openSubscription = this.layoutService.configOpen$.subscribe(() => {
            this.mode = this.layoutService.isDarkTheme() ? 'dark' : 'light';
            this.visible = true;
        });
    }

    ngOnDestroy() {
        this.openSubscription.unsubscribe();
    }

    get groups(): ThemeGroup[] {
        return THEME_FAMILIES
            .map((family) => ({
                family,
                themes: THEMES.filter((theme) => theme.family === family && theme.mode === this.mode),
            }))
            .filter((group) => group.themes.length > 0);
    }

    get activeTheme(): string {
        return this.layoutService.config.theme;
    }

    get scale(): number {
        return this.layoutService.config.scale;
    }

    setMode(mode: ThemeMode) {
        this.mode = mode;
    }

    selectTheme(theme: ThemeOption) {
        this.layoutService.changeTheme(theme.name);
    }

    decrementScale() {
        this.layoutService.changeScale(this.scale - 1);
    }

    incrementScale() {
        this.layoutService.changeScale(this.scale + 1);
    }

    /** `@for` track fn. */
    trackByName(_index: number, theme: ThemeOption) {
        return theme.name;
    }
}
