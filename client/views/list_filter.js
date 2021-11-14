import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../listi';

export default name => {
	name = name || dom.location.query.get('list');

	dom.location.query.set({ view: 'list_filter', list: name });

	const list = listi.state?.lists?.[name] || {};
	// const { name, items, filter } = list;

	if (name && !list) return socketClient.reply('lists', name);

	listi.drawToolkit([{ id: 'lists', onPointerPress: () => listi.draw('list', list) }]);
};
