# `research/pitfalls/` — symptom-indexed record of things that bit us

Append-only. One entry per pitfall, looked up by **symptom** — the words you would actually search
for when it happens again. Delete an entry when it stops applying; a pitfall that cannot be pruned
is a pitfall nobody will maintain.

## Entry format

```
## <symptom, in the words you would search for>
- **Symptom**: what you see
- **Cause**: why it happens
- **Fix / workaround**: what to do
- **Applies to**: <tool / version / environment> — <YYYY-MM-DD>
- **Verified by**: how you know (path or command)
```

## Rules

- **Append.** Correct an entry by adding a dated line, not by rewriting it.
- **Carry the environment and the date.** Without them the entry can never be pruned.
- This file is a **record, not a conclusion**: nothing here grounds a scientific claim.
- The few rules that must be followed **every round** belong in mnemon runtime memory instead
  (it is auto-injected and hard-capped at 10KB). This file is for lookup, not for recall.
- A pitfall discovered while running an experiment also gets one line in that experiment's card.

<!-- EXAMPLE:BEGIN — both entries below are real, observed 2026-10-11. Delete this block. -->
## Editing a file reports "file changed since it was read"

- **Symptom**: `E_STALE_RANGE` / "version guard rejected the write" on a file nobody edited.
- **Cause**: something outside DSH is touching the file's mtime — typically a cloud-sync client
  (OneDrive) watching the workspace.
- **Fix / workaround**: pause sync for that workspace, re-read the file, then retry the edit.
- **Applies to**: DSH hash-anchored file tools + OneDrive on Windows — 2026-10-11
- **Verified by**: the error stopped recurring once sync was disabled for the workspace.

## Querying Zotero's local API fails with a generic "error sending the request"

- **Symptom**: `Invoke-WebRequest http://127.0.0.1:23119/...` fails, while the port is open and
  Zotero is running.
- **Cause**: Zotero answers `HTTP/1.0`; `Invoke-WebRequest` does not handle that response here.
  (Not a proxy problem: `HTTP_PROXY` was unset and WinHTTP was direct.)
- **Fix / workaround**: use `curl.exe` instead — it returns `200` for the same URL.
- **Applies to**: Zotero 7 local API on Windows — 2026-10-11
- **Verified by**: `curl.exe -s -D - -o NUL "http://127.0.0.1:23119/api/users/0/items?limit=1"`
  returned `HTTP/1.0 200 OK` with a `Total-Results` header — the status line is the finding, not the count.
<!-- EXAMPLE:END -->
