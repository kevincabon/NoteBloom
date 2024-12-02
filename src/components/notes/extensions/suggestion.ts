import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import { SuggestionList } from './SuggestionList'
import { ReactRenderer } from '@tiptap/react'
import i18next from 'i18next'

export interface SuggestionItem {
  title: string
  description?: string
  command: (props: any) => void
}

const getSuggestions = () => {
  return [
    {
      title: i18next.t('editor.commands.todoList.title'),
      description: i18next.t('editor.commands.todoList.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleTaskList()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.heading1.title'),
      description: i18next.t('editor.commands.heading1.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 1 })
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.heading2.title'),
      description: i18next.t('editor.commands.heading2.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 2 })
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.heading3.title'),
      description: i18next.t('editor.commands.heading3.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 3 })
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.bulletList.title'),
      description: i18next.t('editor.commands.bulletList.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBulletList()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.orderedList.title'),
      description: i18next.t('editor.commands.orderedList.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleOrderedList()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.bold.title'),
      description: i18next.t('editor.commands.bold.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBold()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.italic.title'),
      description: i18next.t('editor.commands.italic.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleItalic()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.code.title'),
      description: i18next.t('editor.commands.code.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleCode()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.codeBlock.title'),
      description: i18next.t('editor.commands.codeBlock.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleCodeBlock()
          .run()
      },
    },
    {
      title: i18next.t('editor.commands.blockquote.title'),
      description: i18next.t('editor.commands.blockquote.description'),
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBlockquote()
          .run()
      },
    },
  ]
}

export const CommandsExtension = Extension.create({
  name: 'commands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const suggestions = getSuggestions()
          return suggestions.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: ReactRenderer
          let popup: any

          return {
            onStart: props => {
              component = new ReactRenderer(SuggestionList, {
                props,
                editor: props.editor,
              })

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },

            onUpdate(props) {
              component.updateProps(props)

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }

              return component.ref?.onKeyDown(props)
            },

            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      }),
    ]
  },
})
