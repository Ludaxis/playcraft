// Navigation and routing types

export type PageId =
  | 'main-menu'
  | 'gameplay'
  | 'shop'
  | 'settings'
  | 'admin'
  | 'team'
  | 'inbox'
  | 'leaderboard'
  | 'daily-rewards'
  | 'royal-pass'
  | 'sky-race'
  | 'kings-cup'
  | 'team-chest'
  | 'book-of-treasure'
  | 'lightning-rush'
  | 'lava-quest'
  | 'mission-control'
  | 'album'
  | 'collection'
  | 'winning-streak'
  | 'area-tasks'
  | 'boosters'
  | 'friends'
  | 'profile';

export type ModalId =
  | 'level-start'
  | 'level-complete'
  | 'level-failed'
  | 'purchase-confirm'
  | 'reward-claim'
  | 'area-complete'
  | 'event-info'
  | 'booster-select'
  | 'out-of-lives'
  | 'help-request'
  | 'settings'
  | 'free-lives'
  | 'profile-picture'
  | 'edit-avatar'
  | 'star-info'
  | 'sign-in'
  | 'parental-control'
  | 'privacy-policy'
  | 'change-username'
  | 'card-stars'
  | 'collection-info'
  | 'grand-prize'
  | 'collection-set-detail'
  | 'card-detail'
  | 'profile'
  | 'team-info'
  | 'member-profile'
  | 'weekly-contest-info'
  | null;

export interface NavigationState {
  currentPage: PageId;
  previousPage: PageId | null;
  modalStack: ModalId[];
  pageParams: Record<string, unknown>;
}

export interface NavigationAction {
  type: 'NAVIGATE' | 'GO_BACK' | 'OPEN_MODAL' | 'CLOSE_MODAL' | 'CLOSE_ALL_MODALS';
  payload?: {
    page?: PageId;
    modal?: ModalId;
    params?: Record<string, unknown>;
  };
}
