import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { CommandsExtension } from './extensions/suggestion';
import { Toggle } from "@/components/ui/toggle";
import { 
  Bold, 
  Italic, 
  Heading1,
  Heading2,
  Heading3,
  AlignCenter, 
  AlignLeft, 
  AlignRight,
  List,
  ListOrdered,
  Code,
  FileCode,
  Quote,
  Palette,
  CheckSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import '@/styles/taskList.css';
import '@/styles/editor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const { t } = useTranslation('editor');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-list-item',
        },
      }),
      CommandsExtension,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] max-w-none',
        placeholder: placeholder || t('placeholder'),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-2 space-y-2">
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <div className="flex gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label={t('commands.bold.title')}
          >
            <Bold className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label={t('commands.italic.title')}
          >
            <Italic className="h-4 w-4" />
          </Toggle>

          <input
            type="color"
            onChange={(e) => {
              if (editor) {
                editor
                  .chain()
                  .focus()
                  .setColor(e.target.value)
                  .run();
              }
            }}
            value={editor?.getAttributes('textStyle').color || '#000000'}
            className="cursor-pointer w-6 h-6 border border-gray-300 rounded"
            title={t('commands.color.title')}
          />
        </div>

        <div className="flex gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label={t('commands.heading1.title')}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label={t('commands.heading2.title')}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label={t('commands.heading3.title')}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label={t('commands.bulletList.title')}
          >
            <List className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label={t('commands.orderedList.title')}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('taskList')}
            onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
            aria-label={t('commands.todoList.title')}
          >
            <CheckSquare className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            aria-label={t('commands.code.title')}
          >
            <Code className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('codeBlock')}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            aria-label={t('commands.codeBlock.title')}
          >
            <FileCode className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label={t('commands.blockquote.title')}
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            aria-label="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            aria-label="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            aria-label="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};