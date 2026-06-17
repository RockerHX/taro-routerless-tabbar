import { createApp, defineComponent } from 'vue'

export const mountSetup = <T>(setup: () => T) => {
  let exposed!: T
  const root = document.createElement('div')

  const app = createApp(
    defineComponent({
      setup() {
        exposed = setup()
        return () => null
      },
    }),
  )

  app.mount(root)

  return {
    exposed,
    unmount() {
      app.unmount()
      root.remove()
    },
  }
}
