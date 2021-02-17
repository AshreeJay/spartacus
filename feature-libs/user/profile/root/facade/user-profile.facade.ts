import { Injectable } from '@angular/core';
import { StateUtils } from '@spartacus/core';
import { User } from '@spartacus/user/account/root';
import { Observable } from 'rxjs';
import { Title } from '../model/user-profile.model';
import { facadeFactory } from '@spartacus/storefront';
import { USER_PROFILE_FEATURE } from '../feature-name';

export function UserProfileFacadeFactory() {
  return facadeFactory({
    facade: UserProfileFacade,
    feature: USER_PROFILE_FEATURE,
    methods: ['get', 'update', 'close', 'getTitles'],
  });
}

@Injectable({
  providedIn: 'root',
  useFactory: UserProfileFacadeFactory,
})
export abstract class UserProfileFacade {
  abstract get(): Observable<User>;

  /**
   * Updates the user's details.
   *
   * @param details User details to be updated.
   */
  abstract update(details: User): Observable<StateUtils.LoaderState<User>>;

  /**
   * Closes the user account.
   */
  abstract close(): Observable<StateUtils.LoaderState<User>>;

  /**
   * Returns titles that can be used for the user profiles.
   */
  abstract getTitles(): Observable<Title[]>;
}
