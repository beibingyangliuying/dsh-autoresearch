// Client half: the Autoresearch page inside the settings panel.
//
// A real form, not a wall of text: the contact address is an input bound to this bundle's own Config
// through `ctx.remote.settings` - the same channel the built-in settings pages use, so no host half is
// needed. Every remote call answers `{ ok: true, value }` or `{ ok: false, error: { message } }`, and a
// write carries the revision it was based on, which is how a stale write is refused instead of quietly
// clobbering a concurrent edit.
//
// The namespace is not hard-coded: `describe()` answers every namespace, so the page finds the one that
// actually carries `mailto`. A rename on the host side degrades this page rather than breaking it.
//
// UI rules from the reference: the factory is side-effect free, React comes from the browser module
// table, no Harness Client package is imported, colour is inherited rather than literal, and the only
// state is component state, so there is nothing to dispose.
window.__ModuleLoader__.load({
  id: '@beibingyangliuying/dsh-autoresearch-preset',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const muted = { margin: '0 0 6px', lineHeight: 1.6, opacity: 0.8 }
    const heading = { margin: '22px 0 8px', fontSize: '0.95em', fontWeight: 600, opacity: 0.9 }
    const card = { border: '1px solid currentColor', borderRadius: 10, padding: '14px 16px', marginBottom: 12, opacity: 0.95 }
    const row = { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }
    const input = {
      flex: '1 1 22em', minWidth: '14em', padding: '7px 10px', font: 'inherit', color: 'inherit',
      background: 'transparent', border: '1px solid currentColor', borderRadius: 6, opacity: 0.95,
    }
    const button = {
      padding: '7px 16px', font: 'inherit', color: 'inherit', background: 'transparent',
      border: '1px solid currentColor', borderRadius: 6, cursor: 'pointer', opacity: 0.9,
    }
    const label = { display: 'block', fontWeight: 600, marginBottom: 4 }
    const hint = { margin: '6px 0 0', fontSize: '0.9em', lineHeight: 1.55, opacity: 0.7 }
    const code = {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: '0.92em',
      padding: '1px 5px', border: '1px solid currentColor', borderRadius: 4, opacity: 0.85,
    }

    // The component below outlives the apply call, so the context it calls through is held here
    // instead of being closed over from apply's parameter, which the component cannot see.
    let pluginCtx
    /** Find the namespace that carries the contact address, whatever the host calls it. */
    function findNamespace(view) {
      const namespaces = view?.settings ?? view?.forms ?? view?.namespaces ?? view
      if (namespaces === null || typeof namespaces !== 'object') return undefined
      for (const [key, entry] of Object.entries(namespaces)) {
        const value = entry?.value ?? entry
        if (value !== null && typeof value === 'object' && 'mailto' in value) {
          return { ns: entry?.ns ?? key, value, revision: entry?.revision }
        }
      }
      return undefined
    }

    function ContactAddress() {
      const [state, setState] = React.useState({ status: 'loading' })
      const [draft, setDraft] = React.useState('')

      const load = React.useCallback(async () => {
        setState({ status: 'loading' })
        try {
          const response = await pluginCtx.remote.settings.describe()
          if (!response.ok) {
            setState({ status: 'error', message: response.error.message })
            return
          }
          const found = findNamespace(response.value)
          if (found === undefined) {
            setState({ status: 'missing' })
            return
          }
          setState({ status: 'ready', ...found })
          setDraft(String(found.value.mailto ?? ''))
        } catch (error) {
          setState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
        }
      }, [])

      React.useEffect(() => {
        load()
      }, [load])

      const save = React.useCallback(async () => {
        if (state.status !== 'ready' && state.status !== 'saving') return
        const base = state
        setState({ ...base, status: 'saving' })
        try {
          const response = await pluginCtx.remote.settings.update(base.ns, { mailto: draft }, base.revision)
          if (!response.ok) {
            setState({ ...base, status: 'error', message: response.error.message })
            return
          }
          const found = findNamespace(response.value) ?? { ns: base.ns, value: { mailto: draft } }
          setState({ status: 'ready', ...found, saved: true })
          setDraft(String(found.value?.mailto ?? draft))
        } catch (error) {
          setState({ ...base, status: 'error', message: error instanceof Error ? error.message : String(error) })
        }
      }, [state, draft])

      if (state.status === 'loading') return h('p', { style: muted }, 'Reading configuration...')
      if (state.status === 'missing') {
        return h(
          'p',
          { style: muted },
          'The contact-address field is not in the running composition. Configure this bundle from its ',
          'own page under Built-in plugins until it is.',
        )
      }

      const busy = state.status === 'saving'
      return h(
        'div',
        null,
        h('label', { style: label, htmlFor: 'autoresearch-mailto' }, 'Contact address'),
        h(
          'div',
          { style: row },
          h('input', {
            id: 'autoresearch-mailto', style: input, type: 'text', value: draft, spellCheck: false,
            placeholder: 'you@example.org', disabled: busy,
            onChange: (event) => setDraft(event.target.value),
          }),
          h('button', { style: button, type: 'button', disabled: busy, onClick: save }, busy ? 'Saving...' : 'Save'),
        ),
        h(
          'p',
          { style: hint },
          'Sent as ',
          h('code', { style: code }, '&mailto='),
          ' on OpenAlex and Crossref requests, and passed to the reference-library writer. Identifying ',
          'yourself gets faster service and gentler rate limits. Leave it empty to send no contact - ',
          'everything still works.',
        ),
        state.status === 'error' ? h('p', { style: { ...hint, opacity: 0.95 } }, 'Not saved: ', state.message) : null,
        state.saved ? h('p', { style: hint }, 'Saved. A new agent picks it up; a running one keeps its own prompt.') : null,
      )
    }

    function AutoresearchSettings() {
      return h(
        'div',
        { style: { maxWidth: '48em', paddingTop: 4 } },
        h(
          'p',
          { style: muted },
          'A domain-neutral research workbench: an agent preset, eight on-demand research disciplines ',
          'that ship inside this bundle, two external evidence channels, and a scaffold for one study.',
        ),

        h('h3', { style: heading }, 'Configuration'),
        h('div', { style: card }, h(ContactAddress)),

        h('h3', { style: heading }, 'Starting a research session'),
        h(
          'p',
          { style: muted },
          'Select ',
          h('strong', null, 'Autoresearch'),
          ' where the new session is created - a session is created with the default preset and keeps the ',
          'preset it was created with, so switching it later leaves your first message with the default ',
          'agent. Restart the host and resume the session (or spawn a subagent) to get a new agent.',
        ),
      )
    }

    return {
      inject: ['slots', 'remote.settings'],
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