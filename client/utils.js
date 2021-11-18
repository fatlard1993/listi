import socketClient from 'socket-client';

const utils = {
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
		const endDayOfWeek = utils.weekDays[endDate.getDay()];

		if (dayCount === -1) return `Yesterday`;
		if (dayCount === 0) return `Today`;
		if (dayCount === 1) return `Tomorrow`;
		if (absDayCount === 2) return `Day ${isNegative ? 'Before' : 'After'} ${isNegative ? 'Yesterday' : 'Tomorrow'} (${endDayOfWeek})`;
		if (absDayCount < 7) return `${isNegative ? '' : 'In '}${absDayCount} Days${isNegative ? ' Ago' : ''} on ${endDayOfWeek}`;
		if (absWeekCount === 1 && absDayRemainder === 0) return `${isNegative ? 'Last' : 'Next'} ${endDayOfWeek}`;
		if (now.getDate() === endDate.getDate()) return `${isNegative ? 'Last' : 'Next'} Month on ${endDayOfWeek} the ${utils.numWithOrdinal(now.getDate())}`;
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
};

export default utils;
