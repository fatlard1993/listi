import { nanoid } from 'nanoid';

import requestMatch from '../utils/requestMatch';

import itemsRoutes from './items';
import filtersRoutes from './filters';
import staticRoutes from './static';

const router = async (request, server) => {
	try {
		let match;
		let response;

		match = requestMatch('GET', '/', request);
		if (match) return new Response(Bun.file('client/build/index.html'));

		if (process.env.NODE_ENV === 'development') {
			match = requestMatch('GET', '/ws', request);
			if (match) {
				const success = server.upgrade(request, { data: { clientId: nanoid() } });

				return success ? undefined : new Response('WebSocket upgrade error', { status: 400 });
			}
		}

		response = await itemsRoutes(request);
		if (response) return response;

		response = await filtersRoutes(request);
		if (response) return response;

		response = await staticRoutes(request);
		if (response) return response;
	} catch (error) {
		console.error('An error was encountered processing a request\n', error);

		return new Response('Server Error', { status: 500 });
	}
};
export default router;
