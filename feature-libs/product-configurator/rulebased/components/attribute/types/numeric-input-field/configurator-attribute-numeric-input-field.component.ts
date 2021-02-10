import { getLocaleId } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorUISettings } from '../../../config/configurator-ui-settings';
import { ConfigFormUpdateEvent } from '../../../form/configurator-form.event';
import { ConfiguratorAttributeBaseComponent } from '../base/configurator-attribute-base.component';
import { ConfiguratorAttributeNumericInputFieldService } from './configurator-attribute-numeric-input-field.component.service';

@Component({
  selector: 'cx-configurator-attribute-numeric-input-field',
  templateUrl: './configurator-attribute-numeric-input-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorAttributeNumericInputFieldComponent
  extends ConfiguratorAttributeBaseComponent
  implements OnInit, OnDestroy {
  attributeInputForm: FormControl;
  numericFormatPattern: string;
  locale: string;

  @Input() attribute: Configurator.Attribute;
  @Input() group: string;
  @Input() ownerKey: string;
  @Input() language: string;

  @Output() inputChange = new EventEmitter<ConfigFormUpdateEvent>();
  sub: any;

  constructor(
    protected configAttributeNumericInputFieldService: ConfiguratorAttributeNumericInputFieldService,
    protected config: ConfiguratorUISettings
  ) {
    super();
  }

  /**
   * Do we need to display a validation message
   */
  mustDisplayValidationMessage(): boolean {
    const wrongFormat: boolean =
      (this.attributeInputForm.dirty || this.attributeInputForm.touched) &&
      this.attributeInputForm.errors?.wrongFormat;

    return wrongFormat;
  }

  ngOnInit() {
    //locales are available as 'languages' in the commerce backend
    this.locale = this.getInstalledLocale(this.language);

    this.attributeInputForm = new FormControl('', [
      this.configAttributeNumericInputFieldService.getNumberFormatValidator(
        this.locale,
        this.attribute.numDecimalPlaces,
        this.attribute.numTotalLength,
        this.attribute.negativeAllowed
      ),
    ]);
    const numDecimalPlaces = this.attribute.numDecimalPlaces;
    this.numericFormatPattern = this.configAttributeNumericInputFieldService.getPatternForValidationMessage(
      numDecimalPlaces,
      this.attribute.numTotalLength,
      this.attribute.negativeAllowed,
      this.locale
    );
    if (this.attribute.userInput) {
      this.attributeInputForm.setValue(this.attribute.userInput);
    }

    this.sub = this.attributeInputForm.valueChanges
      .pipe(
        debounce(() =>
          timer(this.config.rulebasedConfigurator.inputDebounceTime)
        )
      )
      .subscribe(() => this.onChange());
  }

  /**
   * Hit when user input was changed
   */
  onChange(): void {
    const event: ConfigFormUpdateEvent = this.createEventFromInput();

    if (!this.attributeInputForm.invalid) {
      this.inputChange.emit(event);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  protected createEventFromInput(): ConfigFormUpdateEvent {
    return {
      ownerKey: this.ownerKey,
      changedAttribute: {
        ...this.attribute,
        userInput: this.attributeInputForm.value,
      },
    };
  }

  protected getInstalledLocale(locale: string): string {
    try {
      getLocaleId(locale);
      return locale;
    } catch {
      this.reportMissingLocaleData(locale);
      return 'en';
    }
  }

  protected reportMissingLocaleData(lang: string): void {
    if (isDevMode()) {
      console.warn(
        `ConfigAttributeNumericInputFieldComponent: No locale data registered for '${lang}' (see https://angular.io/api/common/registerLocaleData).`
      );
    }
  }
}