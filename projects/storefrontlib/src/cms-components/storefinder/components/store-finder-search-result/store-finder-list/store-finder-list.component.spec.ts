import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import {
  GoogleMapRendererService,
  I18nTestingModule,
  PointOfService,
  StoreDataService,
} from '@spartacus/core';
import { SpinnerModule } from '../../../../../shared/components/spinner/spinner.module';
import { StoreFinderMapComponent } from '../../store-finder-map/store-finder-map.component';
import { StoreFinderListComponent } from './store-finder-list.component';

const location: PointOfService = {
  displayName: 'Test Store',
};
const stores: Array<PointOfService> = [location];
const locations = { stores: stores, pagination: { currentPage: 0 } };
const STORE_LATITUDE = 35.528984;
const STORE_LONGITUDE = 139.700168;

class StoreDataServiceMock {
  getStoreLatitude(_location: any): number {
    return STORE_LATITUDE;
  }

  getStoreLongitude(_location: any): number {
    return STORE_LONGITUDE;
  }
}

class GoogleMapRendererServiceMock {
  centerMap(_latitute: number, _longitude: number) {}
  renderMap() {}
}

describe('StoreFinderDisplayListComponent', () => {
  let component: StoreFinderListComponent;
  let fixture: ComponentFixture<StoreFinderListComponent>;
  let storeMapComponent: StoreFinderMapComponent;
  let storeDataService: StoreDataService;
  let googleMapRendererService: GoogleMapRendererService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        SpinnerModule,
        I18nTestingModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [StoreFinderListComponent, StoreFinderMapComponent],
      providers: [
        {
          provide: GoogleMapRendererService,
          useClass: GoogleMapRendererServiceMock,
        },
        { provide: StoreDataService, useClass: StoreDataServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreFinderListComponent);
    component = fixture.componentInstance;
    storeDataService = TestBed.inject(StoreDataService);
    googleMapRendererService = TestBed.inject(GoogleMapRendererService);

    spyOn(storeDataService, 'getStoreLatitude');
    spyOn(storeDataService, 'getStoreLongitude');
    spyOn(googleMapRendererService, 'centerMap');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should center store on map', () => {
    component.locations = locations;
    fixture.detectChanges();
    storeMapComponent = fixture.debugElement.query(
      By.css('cx-store-finder-map')
    ).componentInstance;
    spyOn(storeMapComponent, 'centerMap').and.callThrough();

    component.centerStoreOnMapByIndex(0, location);

    expect(storeMapComponent.centerMap).toHaveBeenCalled();
    expect(storeDataService.getStoreLatitude).toHaveBeenCalled();
    expect(storeDataService.getStoreLongitude).toHaveBeenCalled();
  });

  it('should select store from list', () => {
    const itemNumber = 4;
    const storeListItemMock = { scrollIntoView: function () {} };
    spyOn(document, 'getElementById').and.returnValue(storeListItemMock as any);
    spyOn(storeListItemMock, 'scrollIntoView');

    component.selectStoreItemList(itemNumber);

    expect(document.getElementById).toHaveBeenCalledWith('item-' + itemNumber);
    expect(storeListItemMock.scrollIntoView).toHaveBeenCalled();
  });

  it('should show store details', () => {
    component.locations = locations;
    fixture.detectChanges();
    expect(component.isDetailsModeVisible).toBe(false);

    component.centerStoreOnMapByIndex(0, location);
    fixture.detectChanges();
    expect(component.isDetailsModeVisible).toBe(true);
    expect(component.storeDetails).not.toBe(null);
  });

  it('should close store details', () => {
    component.locations = locations;
    fixture.detectChanges();

    component.centerStoreOnMapByIndex(0, location);
    fixture.detectChanges();
    expect(component.isDetailsModeVisible).toBe(true);

    component.hideStoreDetails();
    expect(component.isDetailsModeVisible).toBe(false);
  });
});
