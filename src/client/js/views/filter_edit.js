import socketClient from 'socket-client';

import listi from 'listi';

listi.views.filter_edit = name => {
	const list = listi.state.lists[name] || {};
	// const { name, items, filter } = list;

	listi.drawToolkit([{ id: 'lists', onPointerPress: () => socketClient.reply('list', list) }]);
};
