- Mock data on the dashboard for progress, and a convex function for trackig real progress will be created
- The sidebar and navbar need to be connected to the convex database (not directly but through helper functions)
- Implement fallback "Coming soon" pages for the the lessons that do not have any content or questions yet.
- For the exam part, If the question database is empty display the fallback coming soon for the mock exam page.
Streaks should only increase after a lesson is complete (create a helper function for this).
- Make the logout button on the dashboard work.

## New Observations
- Add an edit button to the published lesson list. This will allow the creator to edit a specific lesson.
- The edit button should direct the creator to the lesson editor page.
- Remove the total students stat from the analytics on the teacher dashboard.
- Work on the payments and paystack connection. 
- After a lesson is completed, the student should be redirected to the lessons page instead of the dashboard.
- Migrate to a better auth service. The current one does not manage sessions well.

[$grill-me](C:\\Users\\HP\\Desktop\\business\\prepwise\\.agents\\skills\\grill-me\\SKILL.md)  I believe the present form of the product is to complex and it is realy hard to add new features. I want to simplify it. I propose: 
1. Removing the teacher and uploader pages and managing everything to a single admin dashboard myself.
2. Generating the lessons with AI via cron Jobs.
3. Removing all the CBT exam, streaks and stats and focusing on only the syllabus tree.
4. Adding proper auth using convex Auth and OAuth.

Grill me thouroughly about the above points taking into acconut the present state of the codebase.
