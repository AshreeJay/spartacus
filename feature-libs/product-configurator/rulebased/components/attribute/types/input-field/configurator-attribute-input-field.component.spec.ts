import { ChangeDetectionStrategy, Directive, Input } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CommonConfigurator } from '@spartacus/product-configurator/common';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorUISettingsConfig } from '../../../config/configurator-ui-settings.config';
import { defaultConfiguratorUISettingsConfig } from '../../../config/default-configurator-ui-settings.config';
import { ConfiguratorAttributeInputFieldComponent } from './configurator-attribute-input-field.component';

@Directive({
  selector: '[cxFocus]',
})
export class MockFocusDirective {
  @Input('cxFocus') protected config: any;
}
describe('ConfigAttributeInputFieldComponent', () => {
  let component: ConfiguratorAttributeInputFieldComponent;
  let fixture: ComponentFixture<ConfiguratorAttributeInputFieldComponent>;
  let DEBOUNCE_TIME: number;
  const ownerKey = 'theOwnerKey';
  const name = 'theName';
  const groupId = 'theGroupId';
  const userInput = 'theUserInput';

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ConfiguratorAttributeInputFieldComponent,
          MockFocusDirective,
        ],
        imports: [ReactiveFormsModule],
        providers: [
          {
            provide: ConfiguratorUISettingsConfig,
            useValue: defaultConfiguratorUISettingsConfig,
          },
        ],
      })
        .overrideComponent(ConfiguratorAttributeInputFieldComponent, {
          set: {
            changeDetection: ChangeDetectionStrategy.Default,
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguratorAttributeInputFieldComponent);
    component = fixture.componentInstance;
    component.attribute = {
      name: name,
      uiType: Configurator.UiType.STRING,
      userInput: undefined,
      required: true,
      incomplete: true,
      groupId: groupId,
    };
    component.ownerType = CommonConfigurator.OwnerType.CART_ENTRY;
    component.ownerKey = ownerKey;
    fixture.detectChanges();
    spyOn(component.inputChange, 'emit');
    DEBOUNCE_TIME =
      defaultConfiguratorUISettingsConfig.productConfigurator
        ?.updateDebounceTime?.input ?? component['FALLBACK_DEBOUNCE_TIME'];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not add classes ng-touch and ng-invalid to the input field.', () => {
    component.attribute.required = false;
    fixture.detectChanges();
    const styleClasses = fixture.debugElement.query(
      By.css('input.form-control')
    ).nativeElement.classList;
    expect(styleClasses).toContain('ng-touched');
    expect(styleClasses).not.toContain('ng-invalid');
  });

  it('should add classes ng-touch and ng-invalid to the input field.', () => {
    const styleClasses = fixture.debugElement.query(
      By.css('input.form-control')
    ).nativeElement.classList;
    expect(styleClasses).toContain('ng-touched');
    expect(styleClasses).toContain('ng-invalid');
  });

  it('should set form as touched on init', () => {
    expect(component.attributeInputForm.touched).toEqual(true);
  });

  it('should emit inputValue onChange', () => {
    component.attributeInputForm.setValue(userInput);
    component.onChange();
    expect(component.inputChange.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ownerKey: ownerKey,
        changedAttribute: jasmine.objectContaining({
          name: name,
          uiType: Configurator.UiType.STRING,
          groupId: groupId,
          userInput: userInput,
        }),
      })
    );
  });

  it('should set userInput on init', () => {
    component.attribute.userInput = userInput;
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.attributeInputForm.value).toEqual(userInput);
  });

  it('should delay emit inputValue for debounce period', fakeAsync(() => {
    component.attributeInputForm.setValue('testValue');
    fixture.detectChanges();
    expect(component.inputChange.emit).not.toHaveBeenCalled();
    tick(DEBOUNCE_TIME);
    expect(component.inputChange.emit).toHaveBeenCalled();
  }));

  it('should delay emit inputValue for debounce fallback with fallback config', fakeAsync(() => {
    component['config'] = undefined;
    component.attributeInputForm.setValue('testValue');
    fixture.detectChanges();
    tick(1); //in case undefined is passed as debounce time it will fire almost immediately
    expect(component.inputChange.emit).not.toHaveBeenCalled();
    tick(DEBOUNCE_TIME);
    expect(component.inputChange.emit).toHaveBeenCalled();
  }));

  it('should only emit once with last value if inputValue is changed within debounce period', fakeAsync(() => {
    component.attributeInputForm.setValue('testValue');
    fixture.detectChanges();
    tick(DEBOUNCE_TIME / 2);
    component.attributeInputForm.setValue('testValue123');
    fixture.detectChanges();
    tick(DEBOUNCE_TIME / 2);
    expect(component.inputChange.emit).not.toHaveBeenCalled();
    tick(DEBOUNCE_TIME);
    expect(component.inputChange.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        changedAttribute: jasmine.objectContaining({
          userInput: 'testValue123',
        }),
      })
    );
  }));

  it('should emit twice if inputValue is changed after debounce period', fakeAsync(() => {
    component.attributeInputForm.setValue('testValue');
    fixture.detectChanges();
    tick(DEBOUNCE_TIME);
    component.attributeInputForm.setValue('testValue123');
    fixture.detectChanges();
    tick(DEBOUNCE_TIME);
    expect(component.inputChange.emit).toHaveBeenCalledTimes(2);
  }));

  it('should not emit inputValue after destroy', fakeAsync(() => {
    component.attributeInputForm.setValue('123');
    fixture.detectChanges();
    component.ngOnDestroy();
    tick(DEBOUNCE_TIME);
    expect(component.inputChange.emit).not.toHaveBeenCalled();
  }));
});
