1. Today we are not going off the NEXT_STEPS.md tasks and focus on 3 things 
	a. Polish and QOL updates.
	b. Desining important modules.
	c. Updating docs and cleanup code + review code.
	
-> Starting with: 
	I. Polish and QOL updates:
		1. Starting with this code change we roll out in release versions. Check if any code change is pending (before doing any tasks this session check if any code / file / anything is pending to be checked in. If yes infrom me what is pending). We start with Alpha Version 1.0.0 where first number from the left is the major version, middle is minor & the last one is any bug-fix. Without manual code review nothing gets merged into development. -- Completed
		2. I want to add a new button to the bottom left of the screen which is going to be present no matter what mode / screen we are in called release notes until we reach Beta version 1.0 This will open a on screen model covering the latest release features added. I want this to be updated with only the latest changes in a short description manner similar to how other websites have path notes / release note before every push. -- Completed
		3. I see that not all buttons / options present in the top bar of sandbox are present in the other 2 modes. WE need to have it consistent  (reused) across all the modes. 
		4. Set it so that the home screen is not scrollable vertically or horizontally 
		5. Select a better font for the entire website, that suites both the themes, is not too stylish to read, easy to read & understand, nothing fancy. 
		6. Each mode has its own canvas, they do not share content from each other (current bug: if I open building blocks there is an empty canvas, if I go to home, open sandbox where I had saved a design, do nothing, come back to home, go to building blocks again. I see the design that was present in sandbox loaded here) this is content leaking between phases. I do not want this
		7. Expand to have Component, Unit and integration tests which will become part of CI pipeline
	
	II. Design important modules:
		1. Use the Fable credits we have to desing the AI validation engine we planned for, in detail
		2. Use the Fable credits we have to understand the shortcommings of our current rule based validation engine and make it robust and scalable
    3. Manual testing guidelines document, UAT testing confirmations guidelines docuemnt (and maintainace guide for both) for verifications before publish
	
	III. Updating docs and cleanup code + review code:
		1. We start with cleaning up docs, remove any unwanted / depricated docs. Update all older docs that remain afterwards.
		2. Same with code, have a quick pass to find any dead / unused code and safely remove it 
		3. Creating and completing the new code review cycle throughly. 
		
	
## GUIDELINES
- Only work on ONE action item at a time.
- Update Branch startegy moving forward not just for these tasks would be to have an integration branch with the release version & release name in the format: release/vReleaseVersion-releaseName eg: release/v1.0.0-qol-updates make this explicit in CLAUDE.md, all changes go in seperate branches and are merged in the integration branches for the release from which we will merge into developement which will be our preview (UAT) and then finally after all validations we move to prod which will be our main branch
- Do not move to the next task until I explicitly approve.
- At the end of every completed task, summarize:
  - Files changed
  - Why they changed
  - Any risks introduced
  - Suggested commit message
- Do not make unrelated changes while implementing a task.
- If you discover a bug outside the current task, note it separately instead of fixing it unless I approve.


The branching strategy would be:
main
│
├── Production
│
develop
│
├── Stable Preview / UAT
│
release/v1.0.0-qol-updates
│
├── feature/release-notes
├── feature/shared-topbar
├── fix/canvas-leak
├── chore/font-update
└── docs/testing-guide