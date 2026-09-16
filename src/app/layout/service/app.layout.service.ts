import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

import { DEFAULT_THEME, THEMES } from '../config/theme-catalog';

const STORAGE_KEY = 'public-pool-ui.appearance';
const MIN_SCALE = 12;
const MAX_SCALE = 16;

export interface AppConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {

    config: AppConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'dark',
        theme: DEFAULT_THEME,
        scale: 14,
    };

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    // Replays: the theme stylesheet loads async, so a late subscriber still gets the swap.
    private configUpdate = new ReplaySubject<AppConfig>(1);

    private overlayOpen = new Subject<any>();

    private configOpen = new Subject<void>();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    /** Emits when something asks for the appearance panel. */
    configOpen$ = this.configOpen.asObservable();

    onMenuToggle() {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive;
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
        }
        else {
            this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    showConfigSidebar() {
        this.state.configSidebarVisible = true;
        this.configOpen.next();
    }

    isOverlay() {
        return this.config.menuMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this.configUpdate.next(this.config);
    }

    /** Restore and apply the saved appearance. Called once at startup. */
    init() {
        const saved = this.readSaved();
        if (saved) {
            this.config = { ...this.config, ...saved };
        }
        this.applyScale();
        // index.html already ships the default theme's <link>.
        if (this.config.theme !== this.currentThemeInDocument()) {
            this.applyTheme(this.config.theme);
        }
    }

    changeTheme(theme: string) {
        if (theme === this.config.theme) {
            return;
        }
        this.config.theme = theme;
        this.config.colorScheme = THEMES.find((option) => option.name === theme)?.mode ?? 'dark';
        this.persist();
        this.applyTheme(theme);
    }

    changeScale(scale: number) {
        const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
        if (clamped === this.config.scale) {
            return;
        }
        this.config.scale = clamped;
        this.persist();
        this.applyScale();
        this.onConfigUpdate();
    }

    canDecreaseScale() {
        return this.config.scale > MIN_SCALE;
    }

    canIncreaseScale() {
        return this.config.scale < MAX_SCALE;
    }

    isDarkTheme() {
        return this.config.colorScheme === 'dark';
    }

    /** Swap the theme link, announcing the change only once the new sheet has loaded. */
    private applyTheme(theme: string) {
        const link = document.getElementById('theme-css') as HTMLLinkElement | null;
        if (!link) {
            this.onConfigUpdate();
            return;
        }

        // Mute colour transitions until the new sheet is painted.
        document.body.classList.add('theme-switching');

        const announce = () => {
            link.removeEventListener('load', announce);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                document.body.classList.remove('theme-switching');
            }));
            this.onConfigUpdate();
        };
        link.addEventListener('load', announce);
        link.setAttribute('href', `assets/layout/styles/theme/${theme}/theme.css`);
    }

    private applyScale() {
        document.documentElement.style.fontSize = `${this.config.scale}px`;
    }

    private currentThemeInDocument(): string | null {
        const link = document.getElementById('theme-css') as HTMLLinkElement | null;
        const match = link?.getAttribute('href')?.match(/theme\/([^/]+)\/theme\.css/);
        return match ? match[1] : null;
    }

    private readSaved(): Partial<AppConfig> | null {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw) as Partial<AppConfig>;
            // Drop an unknown name; it would leave the page with no stylesheet.
            if (parsed.theme && !THEMES.some((option) => option.name === parsed.theme)) {
                delete parsed.theme;
                delete parsed.colorScheme;
            }
            if (typeof parsed.scale === 'number') {
                parsed.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, parsed.scale));
            }
            return parsed;
        } catch {
            // Private browsing and blocked site data both throw here.
            return null;
        }
    }

    private persist() {
        try {
            const { theme, colorScheme, scale } = this.config;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, colorScheme, scale }));
        } catch {
        }
    }

}
