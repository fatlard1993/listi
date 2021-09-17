import Log from 'log';
import dom from 'dom';
import socketClient from 'socket-client';

const log = new Log({ verbosity: parseInt(dom.storage.get('logVerbosity') || 0) });

const listi = {
	log,
	tapAndHoldTime: 900,
	lists: {},
	views: {},
	isEditingText: function () {
		const activeElem = document.activeElement,
			activeNode = activeElem.nodeName;

		if (activeNode && (activeNode === 'textarea' || (activeNode === 'input' && activeElem.getAttribute('type') === 'text'))) return true;

		return false;
	},
	init: function () {
		dom.mobile.detect();

		socketClient.init();

		socketClient.on('lists', lists => {
			listi.draw('lists', lists);
		});

		socketClient.on('list', list => {
			listi.lists[list.name] = list;

			listi.draw('list', list);
		});

		dom.interact.on('keyUp', evt => {
			var { key } = evt;

			log(1)(key);

			if (key === 'Enter' && (listi.isEditingText() || evt.ctrlKey)) {
				if (document.getElementsByClassName('showTagAdd').length) document.getElementById('tagAdd').pointerPressFunction();
				else if (typeof listi.save === 'function') listi.save();
			}
		});
	},
	draw: function (view, arg) {
		if (!view || !listi.views[view]) return log.error()(`"${view}" is an invalid view`);

		dom.empty(dom.getElemById('toolkit'));
		dom.empty(dom.getElemById('list'));

		delete listi.calendar;
		delete listi.save;

		listi.views[view](arg);
	},
	drawToolkit: function (items) {
		var toolkitFragment = dom.createFragment();

		items.forEach(opts => {
			var elemType = 'button';

			if (opts.type) {
				elemType = opts.type;

				delete opts.type;
			}

			dom.createElem(elemType, Object.assign({ appendTo: toolkitFragment }, opts));
		});

		dom.getElemById('toolkit').appendChild(toolkitFragment);
	},
	createTag: function (name) {
		return dom.createElem('li', {
			className: 'tag',
			textContent: name,
			onPointerPressAndHold: evt => {
				dom.remove(evt.target);
			},
		});
	},
	createTagList: function (list = []) {
		return dom.createElem('ul', {
			className: 'tagList',
			appendChildren: list.map(name => {
				return listi.createTag(name);
			}),
		});
	},
};
