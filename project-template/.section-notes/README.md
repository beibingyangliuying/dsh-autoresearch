# `.section-notes/` — where a round drafts what it is about to write

Working files, not deliverables. The `section-notes` discipline hands one paper to one child, the child
reads it and drafts the note bodies here, and **only the parent writes to the reference library**:

```text
.section-notes/
  README.md            this file
  <recordKey>/
    manifest.md        what the child returned: one row per note it drafted
    s2.html            the body of the note for §2
    pages/             rendered page images, for reading a page as an image
```

## Rules

- **Nothing here carries authority.** A draft is `[unverified]` until the parent reads it back from the
  library. A file here is never evidence, never a record, and never quoted as one; deleting one needs no
  permission and no ceremony.
- **No changed note is backed up here.** A section note is a transcription of the paper, so the paper is
  the source; a digest's previous body is kept in the library as a `/digest` + `/retired` note. An
  in-place rewrite is shown by its plan (the old first block) and refused if the note moved, not
  rescued from a file here.
- **One directory per record, named by the library's own key**, so a draft is findable from the record
  and cannot collide with another record's.
- **A manifest is what a child returns.** One row per note: section ordinal · the paper's own heading ·
  the file it drafted · characters · anything it could not read. The parent performs every write and
  every read-back, so the manifest is the entire interface between the two.
- **Anything written here for another round to read opens with `study · batch · date · owner`.** That
  covers a batch brief, a handover and a shared convention. Two rounds sharing a draft directory
  otherwise spend their first minutes working out whose file they are reading, and one of them may be a
  different study entirely.
- **A workspace file does not carry the resolved helper path.** The preset's own command lines print the
  helper directory, and what they print is correct only for the install that is running — a link install,
  a rename, or another machine makes a pasted copy wrong, and a file that stays keeps being wrong. Name
  the program (`zotero-section-note.mjs`), say the path comes from the discipline, and pass a resolved
  path to a child in its prompt when one round needs it.
