import { createApp, defineComponent } from 'vue'

export interface SetupFactory<T> {
  (): T
}

export function mountSetup<T>(setup: SetupFactory<T>) {
  let exposed!: T
  const root = document.createElement('div')

  const app = createApp(
    defineComponent({
      setup() {
        exposed = setup()
        return function renderEmptySetup() {
          return null
        }
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
