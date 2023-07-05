import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AuthModule } from '@ul/auth';
import { CardsPageModule } from '@ul/cards';
import { ClockingModule } from '@ul/clocking';
import { ContactsModule } from '@ul/contacts';
import { ImportantNewsModule } from '@ul/important-news';
import { MapModule } from '@ul/map';
import { MenuModule } from '@ul/menu';
import { NotificationsModule } from '@ul/notifications';
import { PreferencesPageModule } from '@ul/preferences';
import { ReservationModule } from '@ul/reservation';
import { RssPageModule } from '@ul/rss';
import { ScheduleModule } from '@ul/schedule';
import { SocialNetworkModule } from '@ul/social-network';
import { ProjectModuleService, translationsLoaderFactory } from '@ul/shared';
import { StaticPagesModule } from '@ul/static-pages';
import { FeaturesModule } from '@ul/features';
import { environment } from '../environments/environment';
import { ChatbotModule } from '@ul/chatbot';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorModule } from './error/error.module';
import { PageLayoutsModule } from './page-layouts/page-layouts.module';
import { ContactUsModule } from '@ul/contact-us';
import { RestaurantsModule } from '@ul/restaurants';
import { UnreadMailModule } from '@ul/unread-mail';
import { CalendarModule } from '@ul/calendar';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      platform: {
        desktop: (win) => {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(win.navigator.userAgent);
          return !isMobile;
        }
      },
    }),
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ErrorModule,
    PageLayoutsModule,
    PreferencesPageModule,
    AuthModule,
    MapModule.forRoot({
      defaultMapLocation: {
        longitude: 6.183309429175067,
        latitude: 48.69137200828818
      }
    }),
    RssPageModule,
    CardsPageModule.forRoot({
      knownErrors: ['NO_PHOTO', 'NO_ACTIVE_CARD', 'UNPAID_FEES']
    }),
    ScheduleModule.forRoot({
      nextEventsWidget: {
        numberOfEventsLimit: 2,
        numberOfDaysLimit: 7
      },
      previousWeeksInCache: 1,
      nextWeeksInCache: 2,
      managerRoles: ['schedule-manager', 'multi-admin']
    }),
    ImportantNewsModule,
    FeaturesModule,
    ContactsModule.forRoot({
      contactTypes: ['STUDENT', 'STAFF', 'STANDIN']
    }),
    NotificationsModule.forRoot({
      numberOfNotificationsOnFirstLoad: 20,
      numberOfNotificationsToLoadOnScroll: 10
    }),
    ClockingModule,
    ReservationModule.forRoot({
      reservationSsoServiceName: 'https://resa-espace.univ-lorraine.fr/reservationsalles/Authentification.aspx',
      reservationSsoUrlTemplate: 'https://resa-espace.univ-lorraine.fr/reservationsalles/Authentification.aspx?ticket={st}',
    }),
    MenuModule,
    ChatbotModule.forRoot({
      chatbotLogoRegex: /_ully5/i
    }),
    StaticPagesModule,
    ContactUsModule,
    RestaurantsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translationsLoaderFactory,
        deps: [HttpClient, ProjectModuleService]
      }
    }),
    SocialNetworkModule,
    UnreadMailModule,
    CalendarModule.forRoot({
      numberOfEventsLimit: 3
    })
  ],
  providers: [
    { provide: 'environment', useValue: environment },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
