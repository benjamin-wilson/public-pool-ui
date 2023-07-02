import { Component, OnInit } from '@angular/core';
import { IParticlesProps } from 'ng-particles';
import { DeviceDetectorService } from 'ngx-device-detector';
import { loadFull } from 'tsparticles';
import { Container, Engine } from 'tsparticles-engine';

@Component({
  selector: 'app-background-particles',
  templateUrl: './background-particles.component.html',
  styleUrls: ['./background-particles.component.scss']
})
export class BackgroundParticlesComponent implements OnInit {
  public particleStyles!: any;
  public particleOptions!: IParticlesProps;


  constructor(private deviceService: DeviceDetectorService) { }

  ngOnInit(): void {
    this.particleStyles = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      'z-index': -1,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    const color: string = '#96bcf9';
    const lineColor: string = '#afccfa';

    this.particleOptions = {
      fpsLimit: this.deviceService.isDesktop() ? 30 : 1,
      detectRetina: true,
      background: {
        position: "50% 50%",
        repeat: "no-repeat",
        size: "cover"
      },
      fullScreen: {
        zIndex: 1
      },
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: color
        },
        opacity: { value: 0.6 },
        links: {
          distance: 150,
          enable: true,
          color: {
            value: lineColor
          },
          opacity: 0.6
        },
        move: {
          enable: true,
          speed: 0.4
        },
        size: {
          random: true,

        }
      }
    }
  }

  particlesLoaded(container: Container): void {
    console.log(container);
  }

  async particlesInit(engine: Engine): Promise<void> {
    console.log(engine);

    // Starting from 1.19.0 you can add custom presets or shape here, using the current tsParticles instance (main)
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }
}
