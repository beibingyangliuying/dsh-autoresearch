// Client half: the Autoresearch page inside the settings panel.
//
// Registered into `settings.section` ("one settings page per list entry"). The page is deliberately
// static and client-only: it carries the two things a user gets wrong, at the place they go looking.
// Live diagnostics (which disciplines loaded, what the isolation filter kept) need a host-side value
// the client can read, which is a separate piece of work.
//
// Rules followed from the UI-plugin reference: the factory is side-effect free, React comes from the
// browser module table, no Harness Client package is imported, styling uses inherited colour and
// opacity rather than literal colours, and there is nothing to dispose because nothing is registered
// outside `apply`.
window.__ModuleLoader__.load({
  id: '@beibingyangliuying/dsh-autoresearch-preset',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const paragraph = { margin: '0 0 8px', lineHeight: 1.6, opacity: 0.85 }
    const code = {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '0.92em',
      padding: '1px 5px',
      border: '1px solid currentColor',
      borderRadius: 4,
      opacity: 0.85,
    }
    const heading = { margin: '18px 0 6px', fontSize: '0.95em', fontWeight: 600, opacity: 0.9 }

    function AutoresearchSettings() {
      return h(
        'div',
        { style: { maxWidth: '48em', paddingTop: 4 } },
        h(
          'p',
          { style: paragraph },
          'A domain-neutral research workbench: an agent preset, eight on-demand research disciplines ',
          'that ship inside this bundle, two external evidence channels, and a scaffold for one study.',
        ),

        h('h3', { style: heading }, 'Starting a research session'),
        h(
          'p',
          { style: paragraph },
          'Select ',
          h('strong', null, 'Autoresearch'),
          ' where the new session is created. This matters: a session is created with the default ',
          'preset and only then records a later selection, while a live agent keeps the preset it was ',
          'created with. Switching the preset inside an existing session therefore does not re-create ',
          'it, and your first message is still handled by the default agent.',
        ),
        h(
          'p',
          { style: paragraph },
          'If you already switched it mid-session, trigger a new agent — restart the host and resume ',
          'the session, or spawn a subagent from it.',
        ),

        h('h3', { style: heading }, 'Configuring it'),
        h(
          'p',
          { style: paragraph },
          'The rows this bundle declares appear on its own page in this panel, each with an editable ',
          'form. The contact address (',
          h('code', { style: code }, 'mailto'),
          ') lives there: identifying yourself to the free metadata APIs gets faster service and ',
          'gentler rate limits. Leave it empty and no contact is sent — the preset then behaves ',
          'exactly as it does with no configuration at all.',
        ),

        h('h3', { style: heading }, 'The reference-library channel'),
        h(
          'p',
          { style: paragraph },
          'It needs the desktop reference manager running with its local API enabled (Settings → ',
          'Advanced → allow other applications on this computer to communicate with it). The preprint ',
          'channel needs no credentials.',
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'autoresearch',
              order: 40,
              label: 'Autoresearch',
            },
            AutoresearchSettings,
          ),
        )
      },
    }
  },
})
