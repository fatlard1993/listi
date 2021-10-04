# listi

Like "lists", but better because it uses "i" to pluralize.

## Lists

- Custom name
- Sort by: Due date (Past due X days / Due today / Due in X days), Order added
- Filter by: Due date (Today / This week / This month), Tag(s)

### List Items

- Tags | Add any number of custom tags to a list item to help identify and filter
- Due date | A date the item is "due", items can be sorted and filtered by date. Also supports fuzzy dates (date ranges), eg: "the week/month of" (consider usefulness of adding more precision time)
  - Recurring | If a list item has a due date it can also be recurring, which can be an exact pattern (every tuesday) or driven by the completion of the item (a week from being marked completed)
- List link | Complete a list item by completing a chosen list

cache tags for quickly adding common ones allow for index sorting (drag and drop and via menu (swap insert)) need a delete confirmation (maybe requires a press and hold?) research the tap/tap and hold paradigm more (if I can just find a good way to signal that holding does something specific and different) add a delete on complete option to the list item (or maybe a complete action to choose between delete/tag/etc?) tags should have a color due date should show shorthand "X days" when less than 1-2 weeks out

## Views

- Lists | Add a new list, open a saved list, or edit a saved list
  - Create/Edit List | Delete, Edit: name
  - List | Delete, Add a new item, edit an item, complete item, edit filter, edit sort, calendar view
    - Create/Edit List Item | Edit: summary, description, tags, due date, recurring, linked list
    - Edit filter | (includes|excludes) tags, due date (optional range w/ easy presets eg: Today / This week / This month), (summary, description, tags) (includes|excludes) user input
    - Calendar | See/create/edit items from a calendar interface


## Use Cases

- shopping list
- housekeeping list
- project/todo list

----

- List
	- Name
	- Default list item options
	- Sort by due date: Past due X days / Due today / Due in X days / No due date
	- Filter
		- Contains text: Summary/Description/Tags :: Includes/Excludes X (maybe suggest tags that exist in the list?)
		- Due Date: Today, This week/month/year
		- Include unscheduled: true/false

- List item
	- Summary
	- Description
	- Tags
	- Due date
	- Recurring
		- Absolute: Every X day/week/month/year(s) @12:00AM
	- Overdue markings (include stacking missed items)
	- Complete Action
		- Add/Remove Tag X
		- Delete list item
		- Reschedule
			- Relative (Completion Date/Last Due Date): X day/week/month/year(s) after I last completed it


## TODO

- add a top-level calendar that shows items from all lists (with ability to toggle them)
- add top-level list view to see aggregate of all lists (with ability to toggle them)
- tag colors?
- everything as tags? (due dates, etc.)
- multiselect/batch operations (complete, delete)
- add saved sort & filter