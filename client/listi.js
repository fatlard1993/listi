import './styles/listi.css';

import { Log } from 'log';
import dom from 'dom';
import socketClient from 'socket-client';

import views from './components/views';

import { port } from '../constants.json';
import utils from './utils';

const log = new Log({ tag: 'listi', verbosity: parseInt(dom.storage.get('logVerbosity') || 0) });

const DEFAULT_VIEW = 'Lists';

const listi = {
	log,
	tapAndHoldTime: 900,
	lists: {},
	state: {},
	isDev: localStorage.getItem('dev'),
	checkDisabledPointer(evt, cb) {
		if (listi.state.disablePointerPress) {
			listi.state.disablePointerPress = false;
			return;
		}

		cb(evt);
	},
	init() {
		log('init');

		dom.mobile.detect();

		socketClient.init('/api', port);

		socketClient.on('connected', () => {
			log()('connected');

			listi.draw();
		});

		dom.interact.on('keyUp', evt => {
			var { key } = evt;

			log(3)(key);

			if (key === 'Enter' && (utils.isEditingText() || evt.ctrlKey)) {
				if (document.getElementsByClassName('showTagAdd').length) document.getElementById('tagAdd').pointerPressFunction();
				else if (typeof listi.save === 'function') listi.save();
			}
		});

		dom.interact.on('keyDown', utils.stayConnected);

		dom.interact.on('pointerDown', utils.stayConnected);

		window.addEventListener('popstate', ({ state }) => {
			log()('popstate', state);

			listi.draw();
		});
	},
	load(view, args = dom.location.query.parse()) {
		if (!view) view = args.view ? args.view : DEFAULT_VIEW;

		log(1)('load view', { view, args });

		// Temporary patch until I figure what the hell is going on with the history manipulation stuff that is not working...
		window.location.search = `?${dom.location.query.stringify({ ...args, view })}`;

		// listi.draw(view, args);

		// dom.location.query.set({ ...args, view });

		// Store loaded view in browser history
		// window.history.pushState({}, `${document.title} - ${view}`, `${window.location.origin}?${dom.location.query.stringify({ ...args, view })}`);
	},
	draw(view, args = dom.location.query.parse()) {
		if (!view) view = args.view ? args.view : DEFAULT_VIEW;

		log(1)('draw view', { view, args, oldView: listi.state?.currentView?.cleanup });

		if (!views[view]) return listi.draw('Lists', args);

		if (listi.state?.currentView?.cleanup) listi.state.currentView.cleanup();

		const appendTo = dom.getElemById('app');

		listi.state.currentView = new views[view]({ appendTo, ...args }) || {};
	},
};

document.oncontextmenu = evt => {
	evt.preventDefault();
};

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState) utils.stayConnected();
});

dom.onLoad(listi.init);

export default listi;
