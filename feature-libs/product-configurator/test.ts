// This file is required by karma.conf.js and loads recursively all the .spec and framework files
// do NOT re-order imports - ZONE MUST BE IMPORTED FIRST!
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-testing';
// all other imports
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context
  .keys()
  // filter tests from node_modules
  .filter((key) => !key.startsWith('@'))
  .forEach(context);
