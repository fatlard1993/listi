import { GET, POST, PUT, DELETE } from 'vanilla-bean-components';

export const getFilters = async options => await GET('/filters', options);

export const getFilter = async (id, options) => await GET(`/filters/${id}`, options);

export const createFilter = async options => await POST(`/filters`, options);

export const runFilter = async (id, options) => await POST(`/filters/${id}/run`, options);

export const updateFilter = async (id, options) => await PUT(`/filters/${id}`, options);

export const deleteFilter = async (id, options) => await DELETE(`/filters/${id}`, options);
