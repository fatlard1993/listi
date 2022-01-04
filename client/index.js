import './styles/index.css';

import dom from 'dom';
import socketClient from 'socket-client';

import constants from '../constants.js';
import utils from './utils';
import router from './router';

dom.onLoad(() => {
	dom.mobile.detect();

	socketClient.init('/api', constants.port);

	// dom.interact.on('keyUp', evt => {
	// 	const { key } = evt;

	// 	// log(3)(key);

	// 	if (key === 'Enter' && (utils.isEditingText() || evt.ctrlKey)) {
	// 		if (document.getElementsByClassName('showTagAdd').length) document.getElementById('tagAdd').pointerPressFunction();
	// 		else if (typeof listi.save === 'function') listi.save();
	// 	}
	// });

	dom.interact.on('keyDown', utils.stayConnected);

	dom.interact.on('pointerDown', utils.stayConnected);

	router.init();

	document.oncontextmenu = evt => {
		evt.preventDefault();
	};

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState) utils.stayConnected();
	});
});
