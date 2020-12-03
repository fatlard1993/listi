# listi

Like lists, but better


## Lists

* Custom name
* Sort by: Due date (Past due X days / Due today / Due in X days), Order added
* Filter by: Due date (Today / This week / This month), Tag(s)


### List Items

* Tags | Add any number of custom tags to a list item to help identify and filter
* Due date | A date the item is "due", items can be sorted and filtered by date. Also supports fuzzy dates (date ranges), eg: "the week/month of" (consider usefulness of adding more precision time)
	* Recurring | If a list item has a due date it can also be recurring, which can be an exact pattern (every tuesday) or driven by the completion of the item (a week from being marked completed)
* List link | Complete a list item by completing a chosen list


cache tags for quickly adding common ones
allow for index sorting (drag and drop and via menu (swap insert))
need a delete confirmation (maybe requires a press and hold?)
research the tap/tap and hold paradigm more (if I can just find a good way to signal that holding does something specific and different)
add a delete on complete option to the list item  (or maybe a complete action to choose between delete/tag/etc?)
tags should have a color
due date should show shorthand "X days" when less than 1-2 weeks out


## Views

* Lists | Add a new list, open a saved list, or edit a saved list
	* Create/Edit List | Delete, Edit: name
	* List | Delete, Add a new item, edit an item, complete item, edit filter, edit sort, calendar view
		* Create/Edit List Item | Edit: summary, description, tags, due date, recurring, linked list
		* Edit filter | (includes|excludes) tags, due date (optional range w/ easy presets eg: Today / This week / This month), (summary, description, tags) (includes|excludes) user input
		* Edit sort | due date (Past due X days / Due today / Due in X days), index (reverse)
		* Calendar | See/create/edit items from a calendar interface