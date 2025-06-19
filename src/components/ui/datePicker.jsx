'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function formatDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime())
}

export function DatePicker({ placeholder = '', date, onChange , container  }) {
  const [open, setOpen] = React.useState(false)
  const [internalDate, setInternalDate] = React.useState(date || undefined)
  const [month, setMonth] = React.useState(date || undefined)
  const [value, setValue] = React.useState(formatDate(date))

  const handleInputChange = (e) => {
    const input = e.target.value
    const parsedDate = new Date(input)
    setValue(input)

    if (isValidDate(parsedDate)) {
      setInternalDate(parsedDate)
      setMonth(parsedDate)
      onChange && onChange(parsedDate)
    }
  }

  const handleSelect = (selectedDate) => {
    setInternalDate(selectedDate)
    setValue(formatDate(selectedDate))
    setOpen(false)
    onChange && onChange(selectedDate)
  }


  return (
    <div className="flex flex-col gap-3">
     
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder={placeholder}
          className="bg-background pr-10"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover 
          open={open} onOpenChange={setOpen}   
          portal={false} 
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"

            >
              <CalendarIcon className="size-4" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[9999] w-auto overflow-hidden p-0"
            sideOffset={8}
            container={container}
          >
           <Calendar
                mode="single"
                selected={internalDate}
                onSelect={handleSelect}
                defaultMonth={internalDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
