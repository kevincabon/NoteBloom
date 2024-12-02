import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Command } from 'cmdk'
import { SuggestionItem } from './suggestion'
import { cn } from '@/lib/utils'
import 'tippy.js/dist/tippy.css'

export const SuggestionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <Command className="border rounded-lg shadow-md bg-popover p-2 min-w-[200px]">
      <Command.List className="max-h-[300px] overflow-y-auto">
        {props.items.length ? (
          props.items.map((item: SuggestionItem, index: number) => (
            <Command.Item
              key={index}
              onSelect={() => selectItem(index)}
              className={cn(
                'flex flex-col gap-1 p-2 rounded cursor-pointer text-sm text-foreground',
                selectedIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="font-medium">{item.title}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground/80">{item.description}</div>
              )}
            </Command.Item>
          ))
        ) : (
          <div className="p-2 text-sm text-muted-foreground">No results found</div>
        )}
      </Command.List>
    </Command>
  )
})

SuggestionList.displayName = 'SuggestionList'
