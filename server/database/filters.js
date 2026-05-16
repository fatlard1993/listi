import { orderBy } from 'vanilla-bean-components/utils/data';
import { nanoid } from 'nanoid';

import database from './index.js';

const runFilter = (items, filters, sort) => {
	const itemTypes = { name: '', tags: [], due: Number.NaN };

	items = items.filter(item => {
		item = { name: '', tags: [], ...item };

		const failsFilter = filters?.some(filter => {
			let result = false;

			result = Object.entries(filter).some(([key, _filter]) => {
				if (typeof itemTypes[key] === 'string') {
					if (_filter.has && !_filter.has.includes(item[key])) {
						return true;
					}

					if (_filter.not && !_filter.not.every(value => item[key] !== value)) {
						return true;
					}
				}

				if (typeof itemTypes[key] === 'number') {
					if (_filter.before && _filter.before < item[key]) {
						return true;
					}

					if (_filter.after && _filter.after > item[key]) {
						return true;
					}

					if (_filter.notUndefined && !item[key]) {
						return true;
					}
				}

				if (Array.isArray(itemTypes[key])) {
					if (_filter.has && (item[key].length === 0 || !_filter.has.every(value => item[key].includes(value)))) {
						return true;
					}

					if (_filter.not && !_filter.not.every(value => !item[key].includes(value))) {
						return true;
					}
				}
			});

			return result;
		});

		return !failsFilter;
	});

	if (sort) items.sort(orderBy(sort));

	return items;
};

const filters = {
	get data() {
		return database.db.data.filters;
	},
	create(data) {
		const id = nanoid(6);
		const newFilter = { ...data, id };

		filters.data[id] = newFilter;

		database.db.write();

		return newFilter;
	},
	read({ id } = {}) {
		if (id) return filters.data[id] || false;

		return filters.data;
	},
	run({ id, quickFilters }) {
		if (!filters.data[id]) return false;

		const { filter, sort, quickFilters: quickFilterDefinitions } = filters.read({ id });
		const items = database.db.data.items;

		let result = runFilter(Object.values(items), filter, sort);

		if (sort) result.sort(orderBy(sort));

		quickFilters?.forEach(name => {
			result = runFilter(result, quickFilterDefinitions[name].filter, quickFilterDefinitions[name].sort);
		});

		return result;
	},
	update({ id, update }) {
		if (!filters.data[id]) return false;

		const newFilter = { ...filters.data[id], ...update };

		filters.data[id] = newFilter;

		database.db.write();

		return newFilter;
	},
	delete({ id }) {
		if (!filters.data[id]) return false;

		delete filters.data[id];

		database.db.write();

		return true;
	},
};

export default filters;
