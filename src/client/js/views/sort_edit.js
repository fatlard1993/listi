import dom from 'dom';
import socketClient from 'socket-client';

listi.views.sort_edit = function(list){
	listi.drawToolkit([
		{
			id: 'lists',
			onPointerPress: () => {
				socketClient.reply('list', list.name);
			}
		}
	]);
};