import { Log } from 'log';
import dom from 'dom';
import socketClient from 'socket-client';

import views from './components/views';

const log = new Log({ tag: 'listi', verbosity: parseInt(dom.storage.get('logVerbosity') || 0) });

const ROUTES = {
	filters: '/filters',
	filterEdit: '/filters/:id',
	filteredList: '/list/:filterId',
	list: '/list',
	calendar: '/calendar/:filterId',
	itemEdit: '/items/:id',
	itemSchedule: '/items/:id/schedule',
};

const VIEWS = {
	[ROUTES.filters]: views.Filters,
	[ROUTES.filterEdit]: views.FilterEdit,
	[ROUTES.filteredList]: views.List,
	[ROUTES.list]: views.List,
	[ROUTES.calendar]: views.Calendar,
	[ROUTES.itemEdit]: views.ItemEdit,
	[ROUTES.itemSchedule]: views.ItemSchedule,
};

const DEFAULT_PATH = ROUTES.filters;
const DEFAULT_VIEW = 'Filters';

const router = {
	ROUTES,
	VIEWS,
	DEFAULT_PATH,
	DEFAULT_VIEW,
	get path() {
		return window.location.hash.replace(/^#\/?/, '/');
	},
	set path(path) {
		log()('set path', path);

		if (!VIEWS[router.pathToRoute(path)]) path = DEFAULT_PATH;

		window.location.hash = path;

		router.renderView();
	},
	get route() {
		return router.pathToRoute(router.path);
	},
	pathToRoute(path) {
		return VIEWS[path] ? path : Object.keys(VIEWS).find(route => router.routeToRegex(route).test(path));
	},
	routeToPath(route, params) {
		let path = route;

		if (params) {
			Object.keys(params).forEach(key => {
				path = path.replace(new RegExp(`:${key}`), params[key]);
			});
		} else {
			path = path.replace(/\/?:.+/g, '');
		}

		return path;
	},
	routeToRegex(route) {
		return new RegExp(`^${route.replace(/\//g, '\\/').replace(/:[^/]+/g, '(.+)')}$`);
	},
	buildPath(route, params) {
		if (!VIEWS[route]) route = DEFAULT_PATH;

		return router.routeToPath(route, params);
	},
	parseRouteParams(path = router.path) {
		const route = router.pathToRoute(path);
		const routeRegex = router.routeToRegex(route);
		let routeParamValues = path.match(routeRegex);
		let routeParamKeys = route.match(routeRegex);
		const params = {};

		routeParamValues = routeParamValues.slice(1, routeParamValues.length);
		routeParamKeys = routeParamKeys.slice(1, routeParamKeys.length);

		routeParamValues.forEach((param, index) => {
			const name = routeParamKeys[index].slice(1);

			params[name] = param;
		});

		return params;
	},
	init() {
		socketClient.on('connected', () => {
			log()('Websockets connected');

			router.renderView();
		});

		window.addEventListener('popstate', ({ state: popstate }) => {
			log(1)('popstate', popstate);

			router.renderView();
		});
	},
	renderView() {
		const { route } = router;
		const appendTo = dom.getElemById('app');

		if (!VIEWS[route]) {
			log.warn()(`"${route}" is not a valid route .. Rerouting to the default route: ${DEFAULT_PATH}`, VIEWS);

			router.path = DEFAULT_PATH;

			return;
		}

		log()('renderView', route);

		if (router?.view?.cleanup) router.view.cleanup();

		router.view = new VIEWS[route]({ appendTo });
	},
};

export default router;
