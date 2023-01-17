import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetCurrentOrientationResult, ScreenOrientation, ScreenOrientationChange } from '@capawesome/capacitor-screen-orientation';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import allLocales from '@fullcalendar/core/locales-all';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { IonModal } from '@ionic/angular';
import { currentLanguage$ } from '@ul/shared';
import { isAfter, isBefore, sub } from 'date-fns';
import { Observable, Subscription } from 'rxjs';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { displayedEvents$ } from '../schedule.repository';
import { formatDay, ScheduleService } from '../schedule.service';
import { Event } from './../schedule.repository';
import { ScheduleCalendarService } from './schedule-calendar.service';


@Component({
  selector: 'app-schedule-calendar',
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss'],
})
export class ScheduleCalendarComponent {

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @ViewChild('modal') modal: IonModal;

  public viewType$: Observable<string>;
  public isEventDetailOpen = false;
  public selectedEvent: Event;
  public loadScheduleOutOfStateError = false;
  public dateError: string;
  public errorIsBefore: boolean;
  public calendarDisplaySomeDateOutOfState: boolean;
  public initialBreakpoint: number;
  public calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin],
    height: '100%',
    locales: allLocales,
    allDaySlot: false,
    slotEventOverlap: false,
    showNonCurrentDates: false,
    eventClick: info => {
      this.selectedEvent = info.event.extendedProps.event;
      this.isEventDetailOpen = true;
    },
    events: (fetchInfo, successCallback) => {

      this.loadScheduleOutOfStateError = false;
      fetchInfo.end = sub(fetchInfo.end, { days: 1 });

      this.calendarDisplaySomeDateOutOfState = isBefore(fetchInfo.start, this.scheduleService.getStateStartDate())
        || isAfter(fetchInfo.end, this.scheduleService.getStateEndDate());


      if (!this.calendarDisplaySomeDateOutOfState) {
        displayedEvents$.pipe(
          first(),
          map(events => this.scheduleCalendarService.eventsToCalendarEvents(events))
        ).subscribe(events => successCallback(events));
        return;
      }

      this.scheduleService.loadScheduleOutOfStateInterval(formatDay(fetchInfo.start), formatDay(fetchInfo.end))
        .pipe(
          mergeMap(outOfStateSchedule => this.scheduleService.outOfStateScheduleToDisplayedEvents(outOfStateSchedule)),
          first(),
          map((events: Event[]) => this.scheduleCalendarService.eventsToCalendarEvents(events))
        )
        .subscribe(
          events => successCallback(events),
          () => {

            if (this.calendarDisplaySomeDateOutOfState) {
              this.loadScheduleOutOfStateError = true;

              if (isBefore(fetchInfo.start, this.scheduleService.getStateStartDate())) {
                this.errorIsBefore = true;
                this.dateError = formatDay(this.scheduleService.getStateStartDate());
              } else {
                this.errorIsBefore = false;
                this.dateError = formatDay(this.scheduleService.getStateEndDate());
              }
            }

            displayedEvents$.pipe(
              first(),
              map(events => this.scheduleCalendarService.eventsToCalendarEvents(events))
            ).subscribe(events => successCallback(events));
          }
        );
    }
  };

  private subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute,
    private scheduleCalendarService: ScheduleCalendarService,
    private scheduleService: ScheduleService) {
    this.viewType$ = this.route.fragment
      .pipe(
        filter(f => f !== null)
      );
  }

  async ionViewDidEnter() {
    this.initCalendar();

    this.subscriptions.push(this.viewType$.subscribe(viewType => {
      this.changeViewType(viewType);
    }));

    this.subscriptions.push(
      displayedEvents$.pipe(
        tap(() => this.getCalendar().refetchEvents()),
      ).subscribe());
    this.subscriptions.push(this.scheduleService.hideEventEvt.subscribe(() => {
      this.dismissModal();
    }));

    await ScreenOrientation.getCurrentOrientation().then((screenOrientation: GetCurrentOrientationResult) => {
      this.updateBreakpoints(screenOrientation);
    });

    ScreenOrientation.addListener('screenOrientationChange', (screenOrientation: ScreenOrientationChange) => {
      this.updateBreakpoints(screenOrientation);
    });
  }

  ionViewDidLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    ScreenOrientation.removeAllListeners();
  }

  addEventToCalendar(event: Event) {
    this.getCalendar().addEvent({
      start: event.startDateTime,
      end: event.endDateTime,
      backgroundColor: event.course.color,
      extendedProps: {
        event
      }
    });
  }

  initCalendar() {
    this.subscriptions.push(
      currentLanguage$.subscribe(lang => {
        this.getCalendar().setOption('locale', lang);

        // fix a display bug from @fullcalendar/angular in Ionic
        setTimeout(
          () => window.dispatchEvent(new Event('resize'))
        );
      })
    );
  }

  dismissModal() {
    this.isEventDetailOpen = false;
  }

  private changeViewType(viewType: string) {
    if (!this.getCalendar()) {
      return;
    }
    this.getCalendar().changeView(this.getCalendarView(viewType));
  }

  private getCalendarView(viewType: string) {
    switch (viewType) {
      case 'day':
        return 'timeGridDay';
      case 'week':
        return 'timeGridWeek';
      default:
        return 'dayGridMonth';
    }
  }

  private getCalendar(): Calendar {
    return this.calendarComponent?.getApi();
  }

  private updateBreakpoints(screenOrientation: GetCurrentOrientationResult | ScreenOrientationChange) {
    const breakpoint = screenOrientation.type.startsWith('landscape') ? 1 : 0.60;
    this.modal.initialBreakpoint = breakpoint;
    this.modal.setCurrentBreakpoint(breakpoint);
  }
}
