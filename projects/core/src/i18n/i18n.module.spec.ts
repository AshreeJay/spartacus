import { TestBed } from '@angular/core/testing';
import { ConfigInitializer } from '../config/config-initializer/config-initializer';
import { FeatureConfigService } from '../features-config/services/feature-config.service';
import { I18nConfig } from './config/i18n-config';
import { I18nConfigInitializer } from './config/i18n-config-initializer';
import { initI18nConfig } from './i18n.module';

class MockI18nConfigInitializer implements ConfigInitializer {
  readonly scopes = ['i18n.fallbackLang'];
  readonly configFactory = async () => ({});
}

// TODO(#11515): remove it in 4.0
class MockFeatureConfigService {
  isLevel() {
    return true;
  }
}

class MockI18nConfig {
  i18n = {};
}

describe('I18nModule', () => {
  let config: I18nConfig;
  let initializer: I18nConfigInitializer;
  let featureService: FeatureConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: I18nConfigInitializer,
          useClass: MockI18nConfigInitializer,
        },
        { provide: I18nConfig, useClass: MockI18nConfig },
        // TODO(#11515): remove it in 4.0
        { provide: FeatureConfigService, useClass: MockFeatureConfigService },
      ],
    });

    config = TestBed.inject(I18nConfig);
    initializer = TestBed.inject(I18nConfigInitializer);
    featureService = TestBed.inject(FeatureConfigService);

    spyOn(initializer, 'configFactory').and.callThrough();
  });

  it(`should not resolve I18nConfig when it was already configured statically `, () => {
    config.i18n = {
      fallbackLang: 'en',
    };
    const result = initI18nConfig(initializer, config, featureService);
    expect(result).toEqual(null);
  });

  it(`should resolve I18nConfig when it was not configured statically `, () => {
    config.i18n = {};
    const result = initI18nConfig(initializer, config, featureService);
    expect(result).toEqual(initializer);
  });
});
