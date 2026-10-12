// Client half: the Autoresearch page inside the settings panel.
//
// A form, not a wall of text. Fields are declared as data and written together by ONE Apply at the
// foot of the page, so adding a setting means adding an entry to FIELDS rather than another control
// with its own button.
//
// The channel is `ctx.remote.settings`, the same one the built-in settings pages use. Both service
// keys matter: `remote` is the namespace root and `remote.settings` its generated sub-namespace -
// injecting only the latter raises `cannot get property "remote" without inject` on first use. Every
// call answers `{ ok, value }` or `{ ok: false, error }`, and a write carries the revision it was
// based on, so a stale write is refused instead of clobbering a concurrent edit.
//
// The namespace is found rather than hard-coded: `describe()` answers every namespace and the page
// picks the one carrying the fields it edits, so a host-side rename degrades the page instead of
// breaking it.
//
// UI rules from the reference: the factory is side-effect free, React comes from the browser module
// table, no Harness Client package is imported, colour is inherited rather than literal, and the only
// state is component state, so there is nothing to dispose.
window.__ModuleLoader__.load({
  id: '@beibingyangliuying/dsh-autoresearch-preset',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Every setting this page edits. Add an entry here; the form and the Apply write follow. */
    const FIELDS = [
      {
        key: 'mailto',
        label: 'Contact address',
        placeholder: 'you@example.org',
        hint: 'Sent as &mailto= on OpenAlex and Crossref requests, and passed to the reference-library writer. Identifying yourself gets faster service and gentler rate limits. Leave it empty to send no contact - everything still works.',
      },
    ]

    const muted = { margin: '0 0 6px', lineHeight: 1.6, opacity: 0.8 }
    const heading = { margin: '22px 0 8px', fontSize: '0.95em', fontWeight: 600, opacity: 0.9 }
    const card = { border: '1px solid currentColor', borderRadius: 10, padding: '14px 16px', marginBottom: 12, opacity: 0.95 }
    const field = { marginBottom: 18 }
    const label = { display: 'block', fontWeight: 600, marginBottom: 6 }
    const input = {
      display: 'block', width: '100%', boxSizing: 'border-box', padding: '7px 10px', font: 'inherit',
      color: 'inherit', background: 'transparent', border: '1px solid currentColor', borderRadius: 6, opacity: 0.95,
    }
    const hint = { margin: '6px 0 0', fontSize: '0.9em', lineHeight: 1.55, opacity: 0.7 }
    const bar = {
      display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid currentColor',
      paddingTop: 14, marginTop: 4, opacity: 0.95,
    }
    const button = {
      padding: '7px 20px', font: 'inherit', color: 'inherit', background: 'transparent',
      border: '1px solid currentColor', borderRadius: 6, cursor: 'pointer', opacity: 0.9,
    }
    const disabled = { ...button, cursor: 'default', opacity: 0.45 }
    const status = { fontSize: '0.9em', opacity: 0.75 }

    // The component outlives the apply call, so the context it calls through is held at factory
    // level; closing over apply's parameter would throw at runtime while still parsing.
    let pluginCtx

    /** Collect the values this page edits, from whichever namespace carries them. */
    function readNamespaces(view) {
      const namespaces = view?.settings ?? view?.forms ?? view?.namespaces ?? view
      if (namespaces === null || typeof namespaces !== 'object') return []
      return Object.entries(namespaces).map(([key, entry]) => ({
        ns: entry?.ns ?? key,
        value: entry?.value ?? entry,
        revision: entry?.revision,
      }))
    }

    function findTarget(view) {
      // "any of the fields", not "all of them": a field added to FIELDS is not in the stored value yet,
      // so requiring every key would make the page announce that its namespace is missing.
      return readNamespaces(view).find(
        (candidate) =>
          candidate.value !== null &&
          typeof candidate.value === 'object' &&
          FIELDS.some((field) => field.key in candidate.value),
      )
    }

    /** What describe() actually returned, compact enough to read and paste. */
    function describeShape(view) {
      const entries = readNamespaces(view)
      return JSON.stringify(
        {
          topLevelKeys: view !== null && typeof view === 'object' ? Object.keys(view) : typeof view,
          namespaces: entries.map((entry) => ({
            ns: entry.ns,
            valueKeys:
              entry.value !== null && typeof entry.value === 'object' ? Object.keys(entry.value) : typeof entry.value,
          })),
        },
        null,
        2,
      )
    }
    function AutoresearchSettings() {
      const [state, setState] = React.useState({ status: 'loading' })
      const [draft, setDraft] = React.useState({})

      const load = React.useCallback(async () => {
        setState({ status: 'loading' })
        try {
          const response = await pluginCtx.remote.settings.describe()
          if (!response.ok) {
            setState({ status: 'error', message: response.error.message })
            return
          }
          const target = findTarget(response.value)
          if (target === undefined) {
            setState({ status: 'missing', shape: describeShape(response.value) })
            return
          }
          const values = {}
          for (const f of FIELDS) values[f.key] = String(target.value[f.key] ?? '')
          setState({ status: 'ready', ns: target.ns, revision: target.revision, baseline: values })
          setDraft(values)
        } catch (error) {
          setState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
        }
      }, [])

      React.useEffect(() => {
        load()
      }, [load])

      const apply = React.useCallback(async () => {
        if (state.status !== 'ready' && state.status !== 'error') return
        const base = state.status === 'ready' ? state : state.previous
        if (base === undefined) return
        setState({ ...base, status: 'saving' })
        try {
          const response = await pluginCtx.remote.settings.update(base.ns, { ...draft }, base.revision)
          if (!response.ok) {
            setState({ ...base, status: 'ready', error: response.error.message, previous: base })
            return
          }
          const target = findTarget(response.value)
          setState({
            status: 'ready', ns: base.ns, revision: target?.revision ?? base.revision,
            baseline: { ...draft }, saved: true, previous: base,
          })
        } catch (error) {
          setState({ ...base, status: 'ready', error: error instanceof Error ? error.message : String(error), previous: base })
        }
      }, [state, draft])

      if (state.status === 'loading') return h('p', { style: muted }, 'Reading configuration...')
      if (state.status === 'missing') {
        return h(
          'div',
          null,
          h('p', { style: muted },
            'No namespace in this deployment carries the fields this page edits. What describe() answered:'),
          h('pre', { style: { ...hint, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, String(state.shape)),
        )
      }

      const busy = state.status === 'saving'
      const dirty = FIELDS.some((f) => (draft[f.key] ?? '') !== (state.baseline?.[f.key] ?? ''))

      return h(
        'div',
        null,
        h('div', { style: card }, FIELDS.map((f) =>
          h('div', { key: f.key, style: field },
            h('label', { style: label, htmlFor: 'autoresearch-' + f.key }, f.label),
            h('input', {
              id: 'autoresearch-' + f.key, style: input, type: 'text', spellCheck: false,
              placeholder: f.placeholder, value: draft[f.key] ?? '', disabled: busy,
              onChange: (event) => setDraft({ ...draft, [f.key]: event.target.value }),
            }),
            h('p', { style: hint }, f.hint),
          ))),

        h('div', { style: bar },
          h('button', {
            style: busy || !dirty ? disabled : button, type: 'button',
            disabled: busy || !dirty, onClick: apply,
          }, busy ? 'Applying...' : 'Apply'),
          h('span', { style: status },
            state.error ? 'Not applied: ' + state.error
              : state.saved && !dirty ? 'Applied. A new agent picks it up; a running one keeps its own prompt.'
                : dirty ? 'Unsaved changes.'
                  : ''),
        ),

        h('h3', { style: heading }, 'Starting a research session'),
        h('p', { style: muted },
          'Select ', h('strong', null, 'Autoresearch'),
          ' where the new session is created - a session is created with the default preset and keeps the ',
          'preset it was created with, so switching it later leaves your first message with the default ',
          'agent. Restart the host and resume the session (or spawn a subagent) to get a new agent.'),
      )
    }

    return {
      // Both keys are required: `remote` is the namespace root, `remote.settings` its sub-namespace.
      inject: ['slots', 'remote', 'remote.settings'],
      apply(ctx) {
        pluginCtx = ctx
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            { name: 'settings.section', id: 'autoresearch', order: 40, label: 'Autoresearch' },
            AutoresearchSettings,
          ),
        )
      },
    }
  },
})
