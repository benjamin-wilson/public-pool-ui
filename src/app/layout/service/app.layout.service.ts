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

    // Replays, because the theme stylesheet loads asynchronously: a chart created after
    // the swap was requested but before the sheet finished loading would otherwise miss
    // the notification and keep the colours of the outgoing theme.
    private configUpdate = new ReplaySubject<AppConfig>(1);

    private overlayOpen = new Subject<any>();

    private configOpen = new Subject<void>();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    /** Emits when something asks for the appearance panel; the panel owns its own flag. */
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

    /**
     * Restore the saved appearance and apply it. Called once at startup so a reader who
     * picked a theme last visit does not watch the default flash past first.
     */
    init() {
        const saved = this.readSaved();
        if (saved) {
            this.config = { ...this.config, ...saved };
        }
        this.applyScale();
        // index.html already ships a <link> for the default theme, so on a first visit
        // the right stylesheet is in flight and swapping it would be wasted work.
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

    /**
     * Swap what the theme link points at, and announce the change only once the browser
     * reports the new sheet loaded. Charts read their colours from CSS custom
     * properties, so telling them any earlier hands them the outgoing palette.
     */
    private applyTheme(theme: string) {
        const link = document.getElementById('theme-css') as HTMLLinkElement | null;
        if (!link) {
            this.onConfigUpdate();
            return;
        }

        // Components across the app carry colour transitions. Swapping the sheet sets every
        // one of them running at once, which leaves controls part-way between two palettes
        // and, where a background and its text cross over, briefly unreadable. The change
        // is meant to look instant, so transitions are muted until the new sheet is in.
        document.body.classList.add('theme-switching');

        const announce = () => {
            link.removeEventListener('load', announce);
            // Two frames: one for the new sheet to be applied, one for it to be painted.
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
            // A theme that no longer ships would leave the page with no stylesheet at
            // all, so an unknown name is dropped rather than trusted.
            if (parsed.theme && !THEMES.some((option) => option.name === parsed.theme)) {
                delete parsed.theme;
                delete parsed.colorScheme;
            }
            if (typeof parsed.scale === 'number') {
                parsed.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, parsed.scale));
            }
            return parsed;
        } catch {
            // Private browsing and blocked site data both throw here. Appearance is a
            // convenience, so fall back to the default rather than breaking startup.
            return null;
        }
    }

    private persist() {
        try {
            const { theme, colorScheme, scale } = this.config;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, colorScheme, scale }));
        } catch {
            // See readSaved: storage being unavailable must not stop the theme applying.
        }
    }

}
