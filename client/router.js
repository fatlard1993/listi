import { Router } from 'vanilla-bean-components';

import { ListiItems } from './ListiItems';
import { Calendar } from './Calendar';

const paths = { listi: '/listi', listiItem: '/listi/:itemId', calendar: '/listi/:itemId/calendar' };
const views = { [paths.listi]: ListiItems, [paths.listiItem]: ListiItems, [paths.calendar]: Calendar };

const router = new Router({ views });

export default router;
