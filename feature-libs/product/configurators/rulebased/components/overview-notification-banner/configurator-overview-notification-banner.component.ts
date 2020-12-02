import { Component } from '@angular/core';
import {
  CommonConfigurator,
  CommonConfiguratorUtilsService,
  ConfiguratorRouter,
  ConfiguratorRouterExtractorService,
} from '@spartacus/product/configurators/common';
import { ICON_TYPE } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import {
  distinctUntilKeyChanged,
  filter,
  map,
  switchMap,
} from 'rxjs/operators';
import { ConfiguratorCommonsService } from '../../core/facade/configurator-commons.service';
import { Configurator } from '../../core/model/configurator.model';

@Component({
  selector: 'cx-configurator-overview-notification-banner',
  templateUrl: './configurator-overview-notification-banner.component.html',
})
export class ConfiguratorOverviewNotificationBannerComponent {
  routerData$: Observable<
    ConfiguratorRouter.Data
  > = this.configRouterExtractorService.extractRouterData();

  numberOfIssues$: Observable<number> = this.routerData$.pipe(
    filter(
      (routerData) =>
        routerData.owner.type === CommonConfigurator.OwnerType.PRODUCT ||
        routerData.owner.type === CommonConfigurator.OwnerType.CART_ENTRY
    ),
    switchMap((routerData) =>
      this.configuratorCommonsService.getConfiguration(routerData.owner)
    ),
    distinctUntilKeyChanged('configId'),
    map((configuration) => {
      if (configuration.totalNumberOfIssues) {
        return configuration.totalNumberOfIssues;
      } else {
        return this.countNumberOfIssues(configuration);
      }
    })
  );

  iconTypes = ICON_TYPE;

  constructor(
    protected configuratorCommonsService: ConfiguratorCommonsService,
    protected configRouterExtractorService: ConfiguratorRouterExtractorService,
    protected commonConfigUtilsService: CommonConfiguratorUtilsService
  ) {}

  /**
   * Count number of issues for a configuration.
   * This method will be removed when OCC returns the total number of issues.
   * Our calculation does not cover all groups but only the currently selected
   * one
   * @param configuration Current configuration
   * @returns Number of issues
   */
  countNumberOfIssues(configuration: Configurator.Configuration): number {
    const numberOfConflicts = configuration.flatGroups.filter(
      (group) => group.groupType === Configurator.GroupType.CONFLICT_GROUP
    ).length;
    let numberOfIncompleteFields = 0;
    configuration.flatGroups
      .filter(
        (group) => group.groupType === Configurator.GroupType.ATTRIBUTE_GROUP
      )
      .forEach(
        (group) =>
          (numberOfIncompleteFields =
            numberOfIncompleteFields + this.countIssuesInGroup(group))
      );
    return numberOfConflicts + numberOfIncompleteFields;
  }

  protected countIssuesInGroup(group: Configurator.Group): number {
    let numberOfIssues = 0;
    group.attributes.forEach((attribute) => {
      numberOfIssues =
        numberOfIssues + (attribute.incomplete && attribute.required ? 1 : 0);
    });
    return numberOfIssues;
  }
}