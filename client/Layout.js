import { Component, styled } from 'vanilla-bean-components';

export const Content = styled(
	Component,
	() => `
		margin: 0 0 6px;
		overflow: auto;
	`,
);

export const Toolbar = styled(
	Component,
	() => `
		display: flex;
    flex-direction: row;
    position: relative;
    padding: 12px;
    margin-bottom: 12px;
    border-bottom: 2px solid;
	`,
);
