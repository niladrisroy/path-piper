
"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bold, 
  Italic, 
  Link, 
  AtSign, 
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

interface FormatAction {
  type: 'bold' | 'italic' | 'link' | 'mention' | 'bullet' | 'number' | 'quote'
  value?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "What's on your mind?",
  maxLength = 300,
  disabled = false
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(value)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [value])

  const insertFormat = (action: FormatAction) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText = ''
    let cursorPos = start

    switch (action.type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        cursorPos = selectedText ? end + 4 : start + 2
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        cursorPos = selectedText ? end + 2 : start + 1
        break
      case 'link':
        if (action.value) {
          newText = `[${linkText || selectedText || 'link text'}](${action.value})`
          cursorPos = start + newText.length
        }
        break
      case 'mention':
        newText = `@${selectedText || 'username'}`
        cursorPos = selectedText ? end + 1 : start + 1
        break
      case 'bullet':
        newText = `• ${selectedText || 'list item'}`
        cursorPos = selectedText ? end + 2 : start + 2
        break
      case 'number':
        newText = `1. ${selectedText || 'list item'}`
        cursorPos = selectedText ? end + 3 : start + 3
        break
      case 'quote':
        newText = `> ${selectedText || 'quote'}`
        cursorPos = selectedText ? end + 2 : start + 2
        break
    }

    const newValue = value.substring(0, start) + newText + value.substring(end)
    
    if (newValue.length <= maxLength) {
      onChange(newValue)
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(cursorPos, cursorPos)
      }, 0)
    }
  }

  const handleLinkInsert = () => {
    if (linkUrl) {
      insertFormat({ type: 'link', value: linkUrl })
      setShowLinkDialog(false)
      setLinkText('')
      setLinkUrl('')
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex items-center gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormat({ type: 'bold' })}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormat({ type: 'italic' })}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled}
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Input
                placeholder="Link text (optional)"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button onClick={handleLinkInsert} size="sm" className="w-full">
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormat({ type: 'mention' })}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <AtSign className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormat({ type: 'bullet' })}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormat({ type: 'number' })}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormat({ type: 'quote' })}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={undo}
          className="h-8 w-8 p-0"
          disabled={disabled || historyIndex === 0}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={redo}
          className="h-8 w-8 p-0"
          disabled={disabled || historyIndex === history.length - 1}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] resize-none border-0 focus:ring-0 focus:border-0"
        disabled={disabled}
        maxLength={maxLength}
      />

      {/* Character Count */}
      <div className="p-2 border-t bg-gray-50 text-right">
        <span className={`text-xs ${
          value.length > maxLength * 0.9 ? 'text-orange-500' : 
          value.length > maxLength * 0.8 ? 'text-yellow-500' : 'text-gray-400'
        }`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
