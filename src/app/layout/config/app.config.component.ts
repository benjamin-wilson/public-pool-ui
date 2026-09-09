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

    /**
     * The panel owns its own visibility rather than reading the shared layout state, so
     * PrimeNG's two-way `visible` binding has a plain field to write back to.
     */
    public visible = false;

    private readonly openSubscription: Subscription;

    /**
     * Which half of the catalog the picker is showing. It follows the active theme on
     * open, so the panel starts on the tab holding the swatch that is already selected
     * rather than on a list the reader has to switch away from.
     */
    public mode: ThemeMode;

    constructor(public layoutService: LayoutService) {
        this.mode = this.layoutService.config.colorScheme === 'light' ? 'light' : 'dark';
        this.openSubscription = this.layoutService.configOpen$.subscribe(() => {
            // Open on the tab holding the swatch that is already selected, so the reader
            // is not dropped onto a list they have to switch away from.
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

    /** Used by the template's `@for` so switching tabs reuses the swatch elements. */
    trackByName(_index: number, theme: ThemeOption) {
        return theme.name;
    }
}
