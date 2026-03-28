# STANDING INSTRUCTIONS — READ BEFORE DOING ANYTHING

1. Always work on `main` branch only. Never create a new branch. Never use `git checkout -b`. Never open a PR. Commit directly to main.

2. Before starting any task, confirm you are on main:
git checkout main
git pull origin main

3. After every change, commit and push immediately to main:
git add [specific-file-only]
git commit -m "description"
git push origin main

4. Only stage the files you changed. Never use `git add .` — always specify the exact file.

5. One task at a time. Complete and push each task before starting the next.

6. Never delete files unless explicitly told to.

7. Never rewrite full files — make surgical changes only.

8. If there is a conflict, stop immediately and report it. Do not attempt to resolve it yourself.

9. If anything breaks, stop and report. Do not attempt to fix other things while something is broken.

10. Do not touch any file not explicitly mentioned in the task.
