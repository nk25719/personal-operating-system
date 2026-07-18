# POS Manual Test Plan

Run this pass after local data changes, onboarding changes, or recommendation behavior changes. Keep the tone calm: the app should invite one next action without shame or pressure.

## 1. First Launch Onboarding

1. Clear local POS data or install fresh.
2. Open the app.
3. Confirm Today redirects to onboarding.
4. Enter a desired person, current season, three values, one tiny habit, and each recommendation tone option.
5. Tap Begin.
6. Confirm Today opens and onboarding does not show again.
7. Confirm Settings/Profile reflect the desired person, current season, values, tone, and tiny habit.

## 2. Capture Thought

1. Open Capture.
2. Confirm the empty state invites one small note.
3. Save a natural-language thought.
4. Confirm the note appears in Recent and a next step is shown.

## 3. Extracted Task

1. Capture text that includes an action, such as "I should study DICOM tonight."
2. Confirm the extracted action appears under the capture entry.
3. Confirm the suggested module is useful for the note.

## 4. Complete Habit

1. Open Today.
2. Tap one routine or habit checklist item.
3. Confirm it marks complete.
4. Open Review and confirm the daily summary mentions a completed habit.

## 5. Agency Check

1. Open Today.
2. Change autonomy, competence, or relatedness.
3. Confirm the values stay visible.
4. Open Review and confirm the daily summary mentions an agency check update.

## 6. Recommendation Responses

1. Open Today with a recommendation visible.
2. Tap Accept and confirm feedback appears.
3. Repeat with Modify, rewrite the tiny action, and save.
4. Repeat with Dismiss and Snooze.
5. Open Review and confirm Recommendation Memory shows the responses.

## 7. Review Daily Summary

1. Create at least one capture, habit completion, and agency update.
2. Open Review.
3. Confirm Today summarizes the counts in human language.
4. Confirm History lists the local events.

## 8. Weekly Review

1. Add several events or use existing local activity.
2. Open Review.
3. Confirm repeated themes, habits completed most/least, recommendation responses, and one suggested adjustment are shown.

## 9. Export Backup

1. Open Settings.
2. Tap Export my data.
3. Confirm backup JSON appears.
4. Confirm the message says secrets are excluded.
5. Search the JSON text and confirm OpenAI and Notion secrets are not present.

## 10. Preview And Import Backup

1. Paste a valid POS backup JSON into Backup JSON.
2. Confirm the restore preview shows schema version, characters count, habits count, projects count, and tasks count.
3. Confirm the replacement warning is visible.
4. Tap Import backup.
5. Restart or revisit screens and confirm local data reflects the imported backup.
