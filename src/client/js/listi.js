import Log from 'log';
import dom from 'dom';
import socketClient from 'socket-client';

const log = new Log({ verbosity: parseInt(dom.storage.get('logVerbosity') || 0) });

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState) listi.stayConnected();
});

const listi = {
	log,
	tapAndHoldTime: 900,
	lists: {},
	views: {},
	state: {},
	stayConnected() {
		if (socketClient.status === 'open') return;

		let reload = 'soft';

		if (reload === 'soft' && socketClient.triedSoftReload) reload = 'hard';

		socketClient.log()(`Reload: ${reload}`);

		if (reload === 'hard') return window.location.reload(false);

		socketClient.reconnect();

		socketClient.triedSoftReload = true;

		socketClient.resetSoftReset_TO = setTimeout(() => {
			socketClient.triedSoftReload = false;
		}, 4000);
	},
	dayDiff(due, base = new Date()) {
		const _MS_PER_DAY = 1000 * 60 * 60 * 24;

		due = new Date(due);

		base = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
		due = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());

		return Math.floor((due - base) / _MS_PER_DAY);
	},
	weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	numWithOrdinal(num) {
		return `${num}${['', 'st', 'nd', 'rd'][(num / 10) % 10 ^ 1 && num % 10] || 'th'}`;
	},
	dayCountName(dayCount) {
		const absDayCount = Math.abs(dayCount);
		const isNegative = dayCount < 0;
		const absWeekCount = Math.floor(absDayCount / 7);
		const absDayRemainder = Math.floor(absDayCount - absWeekCount * 7);
		const now = new Date();
		const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayCount);
		const endDayOfWeek = listi.weekDays[endDate.getDay()];

		if (dayCount === -1) return `Yesterday`;
		if (dayCount === 0) return `Today`;
		if (dayCount === 1) return `Tomorrow`;
		if (absDayCount === 2) return `Day ${isNegative ? 'Before' : 'After'} ${isNegative ? 'Yesterday' : 'Tomorrow'} (${endDayOfWeek})`;
		if (absDayCount < 7) return `${isNegative ? '' : 'In '}${absDayCount} Days${isNegative ? ' Ago' : ''} on ${endDayOfWeek}`;
		if (absWeekCount === 1 && absDayRemainder === 0) return `${isNegative ? 'Last' : 'Next'} ${endDayOfWeek}`;
		if (now.getDate() === endDate.getDate()) return `${isNegative ? 'Last' : 'Next'} Month on ${endDayOfWeek} the ${listi.numWithOrdinal(now.getDate())}`;
		if (absWeekCount > 0 && absWeekCount < 5) {
			return `${isNegative ? '' : 'In '}${absWeekCount} Week${absWeekCount > 1 ? 's' : ''}${absDayRemainder ? ` and ${absDayRemainder} Day${absDayRemainder > 1 ? 's' : ''}` : ''}${
				isNegative ? ' Ago' : ''
			}`;
		}
		if (absWeekCount > 5) return ``;
	},
	isEditingText() {
		const activeElem = document.activeElement,
			activeNode = activeElem.nodeName;

		if (activeNode && (activeNode === 'textarea' || (activeNode === 'input' && activeElem.getAttribute('type') === 'text'))) return true;

		return false;
	},
	init() {
		dom.mobile.detect();

		socketClient.init();

		socketClient.on('connected', () => {
			listi.log()('connected');

			listi.router();
		});

		socketClient.on('lists', ({ listNames, lists }) => {
			listi.state.listNames = listNames;
			listi.state.lists = lists;

			listi.log()('lists', listNames);

			listi.router();
		});

		dom.interact.on('keyUp', evt => {
			var { key } = evt;

			log(1)(key);

			if (key === 'Enter' && (listi.isEditingText() || evt.ctrlKey)) {
				if (document.getElementsByClassName('showTagAdd').length) document.getElementById('tagAdd').pointerPressFunction();
				else if (typeof listi.save === 'function') listi.save();
			}
		});

		dom.interact.on('keyDown', listi.stayConnected);

		dom.interact.on('pointerDown', listi.stayConnected);
	},
	router() {
		const view = dom.location.query.get('view') || 'lists';

		log()('view', view);

		listi.draw(view);
	},
	draw(view, arg) {
		if (!view || !listi.views[view]) return log.error()(`"${view}" is an invalid view`);

		dom.empty(dom.getElemById('toolbar'));
		dom.empty(dom.getElemById('list'));

		delete listi.calendar;
		delete listi.save;

		listi.views[view](arg);
	},
	drawToolkit(items) {
		var toolbarFragment = dom.createFragment();

		items.forEach(opts => {
			var elemType = 'button';

			if (opts.type) {
				elemType = opts.type;

				delete opts.type;
			}

			dom.createElem(elemType, Object.assign({ appendTo: toolbarFragment }, opts));
		});

		dom.getElemById('toolbar').appendChild(toolbarFragment);
	},
	createTag(name) {
		return dom.createElem('li', {
			className: 'tag',
			textContent: name,
			onPointerPressAndHold: evt => {
				dom.remove(evt.target);
			},
		});
	},
	createTagList(list = []) {
		return dom.createElem('ul', {
			className: 'tagList',
			appendChildren: list.map(name => {
				return listi.createTag(name);
			}),
		});
	},
};
